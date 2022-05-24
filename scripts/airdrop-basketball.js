const csvjson = require('csvjson');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');
const { DefenderRelayProvider } = require('defender-relay-client/lib/web3');
const Web3 = require('web3');
const dotenv = require('dotenv');

var {freeBBModel} = require('../src/Model/FreeBBModel')
var BBHABI = require('../src/config/ABI/BasketBallHead');

dotenv.config({ path: './../.env'});

const delay = ms => new Promise(res => setTimeout(res, ms));

const getSnapshots = ()=> {
    const data = fs.readFileSync(path.join(__dirname, 'input/basketball-snapshot.csv'), { encoding: 'utf8' });
    const options = {
        delimiter: ',', // optional
        headers: 'address,quantity'
    };

    const snapshots = csvjson.toObject(data, options);
    snapshots.shift(); // remove headers
    
    return snapshots;
}

async function airdrop(snapshots) {
  const credentials = { apiKey: process.env.OZ_DEFENDER_API_KEY, apiSecret: process.env.OZ_DEFENDER_SECRET_KEY };
  const provider = new DefenderRelayProvider(credentials, { speed: 'fast' });
  const web3 = new Web3(provider);
  
  const [from] = await web3.eth.getAccounts();
  const contractAddress = process.env.NODE_ENV === 'production' ? process.env.BBH_ADDRESS : process.env.BBH_TEST_ADDRESS;
  const contract = new web3.eth.Contract(BBHABI, contractAddress, { from });
  const failList = [];
  try{
    for(let i =  0; i < snapshots.length; i ++) {
      try{
        contract.methods.safeTransferFrom(process.env.ADMIN_WALLET, snapshots[i].address, 1, snapshots[i].quantity, "0x").send()
        .then(tx=>console.log(tx))
        .catch(err => {
          console.log(err)
          console.log("failed", snapshots[i].address, snapshots[i].quantity)
          failList.push({
            address: snapshots[i].address,
            quantity: snapshots[i].quantity
          })
        })
        .then(async () => {
          if(i == snapshots.length - 1) {
            const csvWriter = createCsvWriter({
              path: `input/failed-basketball-airdrop.csv`,
              header: [
                {id: 'address', title: 'Address'},
                {id: 'quantity', title: 'Quantity'}
              ]
            });
            await csvWriter.writeRecords(failList);
            console.log("done")
            process.exit(1);
          }
        })
        await delay(1000)
      } catch (err) {
        console.log(err, snapshots[i].address, snapshots[i].quantity);
        
      }
    }
    
    
  } catch(err) {
    console.log({err})
  }
}

const main = async ()=> {
    try {
      const snapshots = getSnapshots();
      await airdrop(snapshots);
    } catch(e) {
        console.error(e);
    }
}

main();
