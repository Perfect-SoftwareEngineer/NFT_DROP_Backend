const csvjson = require('csvjson');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');
const Moralis  = require('moralis/node');
const { connect, disconnect } = require('mongoose');
const dotenv = require('dotenv');

var {freeBBModel} = require('../src/Model/FreeBBModel')

dotenv.config({ path: './../.env'});


const serverUrl = process.env.MORALIS_SERVER_URL;
const appId = process.env.MORALIS_APP_ID;

Moralis.start({ serverUrl, appId });

const connectDB = async () => {
  try {
    console.log(`Database connecting to ${process.env.NODE_ENV} environment.`);
    const options = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    };
    
    await connect(
      process.env.MONGODB_PROD_URI,
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

const getHolderByTokenId = async (network, token_address, tokdnId) => {
  let results = [];
  let progress = true;
  let cursor = "";
  let chain;
  if(network == 1)
    chain = "eth";
  else if(network == 137)
    chain = "polygon";
  while(progress) {
      const options = { chain: chain, address: token_address, cursor: cursor, token_id : tokdnId.toString() };
      const nfts = await Moralis.Web3API.token.getNFTOwners(options);
      await Promise.all(nfts.result.map(result => {
          results.push({
              address: result.owner_of,
              token_id: result.token_id,
              quantity: result.amount
          })
      }))
      if(nfts.total < (nfts.page + 1) * nfts.page_size){
          progress = false;
      }
      else {
        cursor = nfts.cursor;
      }
  }
  return results;
}

const main = async ()=> {
    try {
        await connectDB();
        let result = await getHolderByTokenId(1, '0xC57C94346b466bED19438c195ad78CAdC7D09473', 1);
        const unClaimed = await freeBBModel.find({claimed: false});
        const unClaimedData = unClaimed.map(object => ({address: object.wallet, quantity: 1}))
        result = result.concat(unClaimedData);
        let totalAmount = 0;
        result = result.filter((value, index, self) =>{
            if(index === self.findIndex((t) => (t.address === value.address))){
              duplicate = self.filter((t) => t.address === value.address)
              if(duplicate.length > 1) {
                  sum = 0
                  duplicate.map(t => {sum += parseInt(t.quantity)});
                  value.quantity = sum;
              }
              totalAmount += parseInt(value.quantity);
              return value
            }
        })
        try{
          fs.unlinkSync(`input/basketball-snapshot.csv`)
        } catch (err) {
          console.log("file not exist")
        }

        const csvWriter = createCsvWriter({
          path: `input/basketball-snapshot.csv`,
          header: [
            {id: 'address', title: 'Address'},
            {id: 'quantity', title: 'Quantity'}
          ]
        });
        await csvWriter.writeRecords(result);
        console.log(`done, total amount is ${totalAmount}`)
        await disconnectDB();

    } catch(e) {
        console.error(e);
    }
}

main();
