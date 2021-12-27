var HttpStatusCodes = require('http-status-codes');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const { Moralis }  = require('./MoralisController');
const { snapshotModel } = require('./../Model/1226Snapshot');
var { upload } = require('./S3Controller')

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

module.exports = {
    getSnapshot,
    get1226Snapshot
}