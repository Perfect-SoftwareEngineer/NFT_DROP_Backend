
const { connect, disconnect } = require('mongoose');
const log4js = require("log4js");
const { TwitterApi } = require('twitter-api-v2');
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { DefenderRelayProvider } = require('defender-relay-client/lib/web3');
const Web3 = require('web3');

const dotenv = require('dotenv');

const { currentWarriorsMatchModel } = require("../src/Model/CurrentWarriorsMatchModel");
const { freeBBModel } = require("../src/Model/FreeBBModel");
const BBHABI = require('../src/config/ABI/BasketBallHead');

dotenv.config({ path: './../.env'});

// Instantiate Twitter API
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

async function createTweet(status) {
    try {
        const createdTweet = await client.v1.tweet(status, {
            status
        });
        console.log('Tweet', createdTweet.id_str, ':', createdTweet.full_text);
    } catch(e) {
        if (e.code != 403) {
            console.error(e);
        } else {
            console.log('duplicate tweet. Not tweeting...');
        }
    }
}

const connectDB = async () => {
  try {
    console.log(`Database connecting to ${process.env.NODE_ENV} environment.`);
    const production = process.env.NODE_ENV === 'production';
    const options = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    };
    
    await connect(
      production ? process.env.MONGODB_PROD_URI : process.env.MONGODB_DEV_URI,
      options,
    );
    console.log('MongoDB connected!');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
    try {
        await disconnect();
    } catch(error) {
        console.error(error.message);
        process.exit(1);
    }
}

const initMerkleSingle = async (gameId) => {
    whitelist = await freeBBModel.find({game_id : gameId});

    const addresses = [];
    whitelist.map(item => {
        addresses.push(item.wallet);
    })
    const leafNodes = await addresses.map(addr => keccak256(addr));
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
    return merkleTree;
}

const getBbRoot = async (gameId) => {
    const merkleTree = await initMerkleSingle(gameId);
    const rootHash = merkleTree.getHexRoot();
    return rootHash;
}

async function setRootKey(gameId, rootKey, amount) {
    const credentials = { apiKey: process.env.OZ_DEFENDER_API_KEY, apiSecret: process.env.OZ_DEFENDER_SECRET_KEY };
    const provider = new DefenderRelayProvider(credentials, { speed: 'fast' });
    const web3 = new Web3(provider);
    
    const [from] = await web3.eth.getAccounts();
    const contractAddress = process.env.NODE_ENV === 'production' ? process.env.BBH_ADDRESS : process.env.BBH_TEST_ADDRESS;
    const contract = new web3.eth.Contract(BBHABI, contractAddress, { from });
    try{
      await contract.methods.setGameRootKey(gameId, rootKey, amount).send();
    } catch(err) {
      console.log({err})
    }
}

const setMerkleRoot = async (gameId) => {
    const rootKey = await getBbRoot(gameId);
    const matches = await currentWarriorsMatchModel.find({live : false, game_id: gameId}).limit(1);
    if(matches.length > 0) {
      matches[0]['merkled'] = true;
      await matches[0].save();
      console.log(gameId, rootKey, matches[0]['tpm'] * 9)
      await setRootKey(gameId, rootKey, matches[0]['tpm'] * 9);
    }
}

const getMatchDetail = async () => {
    await connectDB();
    const matches = await currentWarriorsMatchModel.find({live: true}).sort({updatedAt: -1}).limit(1);
    var logger = log4js.getLogger();
    logger.level = "all";
    if(matches.length == 0)
        logger.warn("no live game data");
    else {
        logger = log4js.getLogger('Game Id');
        logger.info(matches[0]['game_id'])
        logger = log4js.getLogger('Opposite team');
        logger.info(matches[0]['opposite_team'])
        logger = log4js.getLogger('3 point score');
        logger.info(matches[0]['tpm'])
    }
    await disconnectDB();
}

const setTpm = async () => {
    // Connect to db
    await connectDB();

    var logger = log4js.getLogger();
    logger.level = "all";

    const matches = await currentWarriorsMatchModel.find({live: true}).sort({updatedAt: -1}).limit(1);

    if(matches.length == 0) {
        logger.warn("no live game data");
    } else {
        try {
            for(let i = 0; i < 9 ; i ++) {
                await freeBBModel.create({
                    'game_id': matches[0]['game_id'],
                    'wallet': '0x'
                })
            }
            matches[0]['tpm'] += 1;
            await matches[0].save();
            logger = log4js.getLogger('3 point score');
            logger.info(matches[0]['tpm'])
            
            if (process.env.NODE_ENV==='production') {
                console.log('creating tweet');
                await createTweet(`Steph Curry scores another 3 in the 2022 playoffs! Rand #${Math.floor(Math.random() * 100)}`);
            }
        } catch (err) {
            logger.error(err);
        }
    }
    
    // Close DB connection
    await disconnectDB();
}

const startMatch = async () => {
    await connectDB();

    var logger = log4js.getLogger();
    logger.level = "all";
    let gameId = 0;
    try{
        const matches = await currentWarriorsMatchModel.find().sort({updatedAt: -1}).limit(1);
        if(matches.length > 0) {
            if(matches[0].live)
            {
                logger.warn("live match exisit");
                await disconnectDB();
                return
            } else {
                gameId = matches[0].game_id + 1;
            }
        }
        await currentWarriorsMatchModel.create({
            game_id : gameId,
            season: 0,
            opposite_team: "_",
            tpm: 0,
            live: true
        })
        logger.info("done");
        await disconnectDB();
    } catch (err) {
        console.log(err)
    }
}

const endMatch = async () => {
    await connectDB();

    var logger = log4js.getLogger();
    logger.level = "all";
    try{
        const matches = await currentWarriorsMatchModel.find().sort({updatedAt: -1}).limit(1);
        if(matches.length > 0 && matches[0].live) {
            matches[0].live = false;
            await matches[0].save();
            // TODO - stop queue && make merkle tree
            await setMerkleRoot(matches[0]['game_id'])
        } else {
            logger.warn("no live match");
        }
        logger.info("done");
        await disconnectDB();
    } catch (err) {
        console.log(err)
    }
}

const main = () => {
    const args = process.argv;
    switch(args[2].toLocaleLowerCase()) {
        case "info":
            getMatchDetail();
            break;
        case "update":
            setTpm();
            break;
        case "start":
            startMatch();
            break;
        case "end":
            endMatch();
            break;
    }
}


main()