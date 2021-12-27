const Web3 = require("web3");
var HttpStatusCodes = require('http-status-codes');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const { Moralis }  = require('./MoralisController');
const { snapshotModel } = require('./../Model/1226Snapshot');
var { upload } = require('./S3Controller')
var GalaABI = require('../config/ABI/Gala');

const csvWriter = createCsvWriter({
  path: 'snapshot.csv',
  header: [
    {id: 'address', title: 'Address'},
    {id: 'token_id', title: 'Token Id'},
    {id: 'quantity', title: 'Quantity'}
  ]
});

require("dotenv").config();

const getSnapshot = async (request, response) => {
  try {
    await getHolderData(response);
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

const getHolderData = async (response) => {
    try{
        let progress = true;
        let offset = 0;
        let results = [];
        let results_id = [];
        while(progress) {
            
            const options = { chain: 'polygon', address: process.env.DROP1_ADDRESS, offset: offset };
            console.log(options)
            const nfts = await Moralis.Web3API.token.getNFTOwners(options);
            await Promise.all(nfts.result.map(result => {
                results.push({
                    address: result.owner_of,
                    token_id: result.token_id,
                    quantity: result.amount
                })
                results_id.push(result.owner_of)
            }))
            console.log(nfts.total, nfts.page, nfts.page_size)
            if(nfts.total < (nfts.page + 1) * nfts.page_size){
                progress = false;
            }
            else {
                offset = (nfts.page + 1) * nfts.page_size;
            }
        }

        // const unique =  [...new Set(results)];
        // results = results.filter((value, index, self) =>
        //     index === self.findIndex((t) => (
        //         t.address === value.address && t.token_id === value.token_id
        //     ))
        // )
        await csvWriter.writeRecords(results);
        const fileContent = fs.readFileSync('snapshot.csv');
        upload(fileContent, 'SnapShot.csv', 'text/csv', response);
    } catch(err) {
        console.log(err)
        return [];
    }
}

// Get Snapshot as JSON
const get1226Snapshot = async (request, response) => {
    try {
      await get1226HolderData(response);
    } catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
    }
}

// Get Snapshot as JSON Helper
const get1226HolderData = async (response) => {
    const snapshots = await snapshotModel.find({});
    
    return response.json(snapshots);
}


const setQuantityByScript = async () => {
  try{
    const snapshots = await snapshotModel.find({});
    const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/2de4d25aeea745b181468b898cf4e899'));
    web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY)
    const account = web3.eth.accounts.wallet[0].address;

    console.log(account);
    const gala = new web3.eth.Contract(GalaABI, '0x3f33B087BDc3fB4b8f76c202277f37F535F7bfd6');
    const gasPrice = web3.utils.toWei('70', 'gwei');
    const failList = [];
    for(let i = 0; i < snapshots.length; i ++) {
      try{
        await gala.methods.setMintQuantities(snapshots[i].address, snapshots[i].tokenId, snapshots[i].quantity).send({from : account, gasPrice: gasPrice, gasLimit: '71223',});
        console.log("success", snapshots[i].address, snapshots[i].tokenId, snapshots[i].quantity)
      } catch (err) {
        console.log("failed", snapshots[i].address, snapshots[i].tokenId, snapshots[i].quantity);
        failList.push({
          address: snapshots[i].address,
          tokenId: snapshots[i].tokenId,
          quantity: snapshots[i].quantity
        })
      }
    }
    console.log(failList)
  } catch(err) {
    console.log({err})
  }
}
module.exports = {
    getSnapshot,
    get1226Snapshot,
    setQuantityByScript
}