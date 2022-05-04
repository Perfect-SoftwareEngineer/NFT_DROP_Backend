const { default: axios } = require("axios");
const { DefenderRelayProvider } = require('defender-relay-client/lib/web3');
const Web3 = require('web3');
const cron = require("node-cron");

const {getBBRoot} = require('../Controller/MerkleCurryV2Controller');
const { threesCurryModel } = require("../Model/ThreesCurryModel");
const { currentWarriorsMatchModel } = require("../Model/CurrentWarriorsMatchModel");
const { freeBBModel } = require("../Model/FreeBBModel");
const { createTweet, client } = require('./twitter');
const BBHABI = require('../config/ABI/BasketBallHead');

require("dotenv").config();

// to confirm match ends
var noResponseCount = 0;


tpmCron = cron.schedule("*/1 * * * *", () => {
  runTpmMatchJob()
}, {
  scheduled: false
});


// 3pt twitter bot

/**
 *
 * @param {number} playerId
 * @param {number} value
 */
 const storeTotalThreesInDB = (playerId, value) => {
  threesCurryModel.updateOne(
    { playerId },
    {
      playerId,
      value,
    },
    { upsert: true }, (error, result) => {console.log(error, result)}
  );
};

/**
 * @param {number} playerId => ThreesCurryModel
 */
const checkDBValue = (playerId) => {
    return threesCurryModel.findOne({ playerId });
}


/**
 *
 * @param {number} playerId
 * @param {(playerId: number, totalThrees: number) => void} cb
 */
 const tpmFetcher = (playerId, cb) => {
  const options = {
    method: "GET",
    url: `https://api-nba-v1.p.rapidapi.com/statistics/players/playerId/${playerId}`,
    headers: {
      "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
      "x-rapidapi-key": process.env.API_NBA_KEY,
    },
  };
  
  axios(options)
    .then((response) => {
      const currCount = {
        489: 2899,
      };

      const { data } = response;
      if (data.api && data.api.statistics.length) {
        const { statistics } = data.api;
        const newGames = statistics.slice(Object.keys(currCount)[0]);
        let tpmCount = 0;
        if (newGames.length) {
          newGames.forEach((value, i) => {
            let count = parseInt(value.tpm);

            if (count) {
              tpmCount += count;
            }
          });
        }

        const totalThrees = currCount["489"] + tpmCount;
        cb(playerId, totalThrees);
      }
    })
    .catch(function (error) {
      console.error(error);
    });
};

/**
 * Run subroutine to
 * 1. Fetch new TPM value
 * 2. Compare value to check if it needs to be updated/tweeted about
 * 3. Update/Tweet about it if necessary
 */
const runTpmJob = () => {
  tpmFetcher(124, async (playerId, value) => {
      const document = await checkDBValue(playerId);
      
      if (!document) {
          await threesCurryModel.create({ playerId: 124, value });
          return;
      };
      
      if (document.value !== value) {
          // await addFreeMint(value - document.value);
          await storeTotalThreesInDB(playerId, value);
          
          // await createTweet(`Steph Curry 3-point count: ${value}`);
      }
  });
};



const getLiveMatch = (cb) => {
  const optionlive = {
    method: 'GET',
    url: 'https://api-nba-v1.p.rapidapi.com/games/',
    params: {live: 'all'},
    headers: {
      "x-rapidapi-host": 'api-nba-v1.p.rapidapi.com',
      "x-rapidapi-key": process.env.API_NBA_V2_KEY
    }
  };
  axios(optionlive)
    .then((response) => {
      const { data } = response;
      let currentMatch = {
        gameId: 0,
        season: 0,
        oppositeTeam: ''
      }
      if(data.response.length > 0) {
        
        for(let i = 0; i < data.response.length ; i ++) {
          const match = data.response[i];
          if(match.teams.visitors.id == 11) 
            currentMatch = {gameId: match.id, season: match.season, oppositeTeam: match.teams.home.name};
          else if (match.teams.home.id ==11)
            currentMatch = {gameId: match.id, season: match.season, oppositeTeam: match.teams.visitors.name};
        }
      }
      console.log(currentMatch)
      cb(currentMatch.gameId, currentMatch.season, currentMatch.oppositeTeam)
    })
    .catch((err) => {
      // console.log(err)
    })
}

const getTmpMatch = (playerId, gameId, season, cb) => {
  // 124 10878 2021
  const optionPlayer = {
    method: 'GET',
    url: 'https://api-nba-v1.p.rapidapi.com/players/statistics',
    params: {id: playerId, game: gameId, season:season},
    headers: {
      'X-RapidAPI-Host': 'api-nba-v1.p.rapidapi.com',
      'X-RapidAPI-Key': process.env.API_NBA_V2_KEY
    }
  };
  
  axios(optionPlayer)
    .then((response) => {
      const { data } = response;
      let tpm = 0;
      if(data.response.length > 0){
        tpm = data.response[0].tpm * 3;
      }
      cb(tpm);
    })
    .catch((err) => {
      console.log(err)
    })
}



async function setRootKey(gameId, rootKey, amount) {
  const credentials = { apiKey: process.env.OZ_DEFENDER_API_KEY, apiSecret: process.env.OZ_DEFENDER_SECRET_KEY };
  const provider = new DefenderRelayProvider(credentials, { speed: 'fast' });
  const web3 = new Web3(provider);
  
  const [from] = await web3.eth.getAccounts();
  const contract = new web3.eth.Contract(BBHABI, process.env.BBH_ADDRESS, { from });
  try{
    const tx = await contract.methods.setGameRootKey(gameId, rootKey, amount).send();
    console.log(tx)
  } catch(err) {
    console.log({err})
  }
}


const runLiveMatchJob = () => {
  getLiveMatch(async (gameId, season, oppositeTeam) => {
    try{
      const matches = await currentWarriorsMatchModel.find().sort({updatedAt: -1}).limit(1);
      if(gameId != 0) {
	      noResponseCount = 0;
        if(!(matches.length > 0 && matches[0].game_id == gameId)){
          await currentWarriorsMatchModel.create({
            game_id : gameId,
            season: season,
            opposite_team: oppositeTeam,
            tpm: 0,
            live: true
          })
          // TODO - start fetching 3pt score of curry for this game id
        }
      }
      else {
        if(matches.length > 0 && matches[0].live) {
          if(++noResponseCount == 3) {
            matches[0].live = false;
            await matches[0].save();
            noResponseCount = 0;
            // TODO - stop queue && make merkle tree
            removeTpmMatchJob(matches[0]['game_id'])
          }
        }
      }
    } catch (err) {
      console.log(err)
    }
  })
}

const runTpmMatchJob = async () => {
  const matches = await currentWarriorsMatchModel.find({live : true}).sort({updatedAt: -1}).limit(1);
  if(matches.length > 0) {
    getTmpMatch(124, matches[0]['game_id'], matches[0]['season'], async (tpm) => {
      if(tpm > matches[0]['tpm']) {
        const newTpmCount = tpm - parseInt(matches[0]['tpm']);
        for(let i = 0 ; i < newTpmCount; i ++){
          await freeBBModel.create({
            'game_id': matches[0]['game_id'],
            'wallet': '0x'
          })
        }
        matches[0]['tpm'] = tpm;
        await matches[0].save();
      }
    })
  }
}

const removeTpmMatchJob = async (gameId) => {
  //ToDo - Build Merkle Tree
  setTimeout(setMerkleRoot, 3600000, gameId)
}

const setMerkleRoot = async (gameId) => {
  const rootKey = await getBBRoot(gameId);
  const matches = await currentWarriorsMatchModel.find({live : false, game_id: gameId}).limit(1);
  if(matches.length > 0) {
    matches[0]['merkled'] = true;
    await matches[0].save();
    console.log(gameId, rootKey, matches[0]['tpm'])
    setRootKey(gameId, rootKey, matches[0]['tpm']);
  }
}
module.exports = {
  tpmFetcher,
  storeTotalThreesInDB,
  runTpmJob,
  runLiveMatchJob,
  runTpmMatchJob
};
