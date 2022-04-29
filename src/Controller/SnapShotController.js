const Web3 = require("web3");
var HttpStatusCodes = require('http-status-codes');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const { Moralis }  = require('./MoralisController');
const { snapshotModel } = require('./../Model/1226Snapshot');
const {intelSnapshotDrop1Model} = require('../Model/IntelSnapshotDrop1Model');
const {intelSnapshotDrop2Model} = require('../Model/IntelSnapshotDrop2Model');
const {intelSnapshotDrop3Model} = require('../Model/IntelSnapshotDrop3Model');
const {curryV2GCFSnapshotModel} = require('../Model/CurryV2GCFSnapshotModel');
const { rklSnapshotModel } = require('./../Model/RKLSnapshot');
var { upload } = require('./S3Controller')
var GalaABI = require('../config/ABI/Gala');

require("dotenv").config();

const delay = ms => new Promise(res => setTimeout(res, ms));

const getCurrentDate = () => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = mm + '-' + dd + '-' + yyyy;
  return today;
}
const updateSnapshotClaim = async (request, response) => {
    try {
      const {
        address,
      } = request.body;

      let metadata = await snapshotModel.find({ address });
      if (!address) {
        return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
      }
      await snapshotModel.updateMany({ address: address.toLowerCase() }, { claimed: true });
    
      return response.status(HttpStatusCodes.OK).json({ success: true });
    } catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
    }
}

const getSnapshot = async (request, response) => {
  try {
    await getHolderData(response);
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

const getHolderData = async (response) => {
    try{
        
        let results = [];
        let results_id = [];
        for(let i = 1; i <= 5 ; i ++) {
          const data = await getHolderByTokenId(process.env.DROP1_ADDRESS, i);
          results = results.concat(data);
          await delay(10000);

        }
        results = results.filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.address === value.address && t.token_id === value.token_id
            ))
        )
        await curryV2GCFSnapshotModel.deleteMany({});

        results.map(async (list) => {
          try{
              const data = new curryV2GCFSnapshotModel({
                  address : list.address,
                  token_id : list.token_id,
                  quantity : list.quantity
              })
              await data.save()
          } catch(err) {}
        })

        const today = getCurrentDate();

        const csvWriter = createCsvWriter({
          path: `${today}-snapshot.csv`,
          header: [
            {id: 'address', title: 'Address'},
            {id: 'token_id', title: 'Token Id'},
            {id: 'quantity', title: 'Quantity'}
          ]
        });
        await csvWriter.writeRecords(results);
        
        const fileContent = fs.readFileSync(`${today}-snapshot.csv`);
        fs.unlinkSync(`${today}-snapshot.csv`)
        upload(fileContent, `${today}-snapshot.csv`, 'text/csv', response);
        return `${today}-snapshot.csv`;
    } catch(err) {
        console.log(err)
        return [];
    }
}

const getIntelSnapshotDrop1 = async (request, response) => {
  try {
    await getIntelHolderData("drop1", response);
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

const getIntelSnapshotDrop2 = async (request, response) => {
  try {
    await getIntelHolderData("drop2", response);
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

const getIntelSnapshotDrop3 = async (request, response) => {
  try {
    await getIntelHolderData("drop3", response);
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

const getIntelHolderData = async (drop, response) => {
    try{
        
        let results = [];
        let results_id = [];

        const data = await getHolderByTokenId(process.env.INTEL_ADDRESS, 1);
        results = results.concat(data);

        results = results.filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.address === value.address && t.token_id === value.token_id
            ))
        )
        let dbModel;
        if(drop == "drop1") {
          dbModel = intelSnapshotDrop1Model;
        } else if(drop == "drop2") {
          dbModel = intelSnapshotDrop2Model;
        } else {
          dbModel = intelSnapshotDrop3Model;
        }
        
              
        await dbModel.remove({});

        results.map(async (list) => {
          try{
              const data = new dbModel({
                  address : list.address,
                  token_id : list.token_id,
                  quantity : list.quantity
              })
              await data.save()
          } catch(err) {}
      })

      const today = getCurrentDate();

      const csvWriter = createCsvWriter({
        path: `${today}-${drop}-intel-snapshot.csv`,
        header: [
          {id: 'address', title: 'Address'},
          {id: 'token_id', title: 'Token Id'},
          {id: 'quantity', title: 'Quantity'}
        ]
      });

      await csvWriter.writeRecords(results);

      const fileContent = fs.readFileSync(`${today}-${drop}-intel-snapshot.csv`);
      upload(fileContent, `${today}-${drop}-intel-snapshot.csv`, 'text/csv', response);
    } catch(err) {
        console.log(err)
        return [];
    }
}

const getHolderByTokenId = async (token_address, tokdnId) => {
  let results = [];
  let progress = true;
  let cursor = "";
  const chain = process.env.NODE_ENV == 'production' ? "polygon" : "mumbai";
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

// Get Snapshot as JSON
const get1226Snapshot = async (request, response) => {
    try {
      await get1226HolderData(response);
    } catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
    }
}

// Get Snapshot as JSON
const getIntelSnapshotList = async (request, response) => {
  const { address } = request.params;
  drop1_count = await intelSnapshotDrop1Model.countDocuments();
  drop2_count = await intelSnapshotDrop2Model.countDocuments();
  drop3_count = await intelSnapshotDrop3Model.countDocuments();

  const q1 = drop1_count == 0 ? -1 : 0;
  const q2 = drop2_count == 0 ? -1 : 0;
  const q3 = drop3_count == 0 ? -1 : 0;

  drop1 = await intelSnapshotDrop1Model.find({address: address.toLowerCase()});
  drop2 = await intelSnapshotDrop2Model.find({address: address.toLowerCase()});
  drop3 = await intelSnapshotDrop3Model.find({address: address.toLowerCase()});
  const data = {
    "drop1" : drop1[0] ? Number(drop1[0]['quantity']) : q1,
    "drop2" : drop2[0] ? Number(drop2[0]['quantity']) : q2,
    "drop3" : drop3[0] ? Number(drop3[0]['quantity']) : q3,
  }
  return response.status(HttpStatusCodes.OK).send(data);
}


// Get Snapshot as JSON Helper
const get1226HolderData = async (response) => {
    const snapshots = await snapshotModel.find({});
    
    return response.json(snapshots);
}



const get1226SnapshotIndividual = async (request, response) => {
    try {
      await get1226SnapshotIndividualData(request, response);
    } catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
    }
}

const get1226SnapshotIndividualData = async (request, response) => {
    const { address } = request.params;
    const snapshots = await snapshotModel.find({
        address: address.toLowerCase()
    });
    
    return response.json(snapshots);
}


const getRklSnapshot = async (request, response) => {
    try {
      await getRklSnapshotData(request, response);
    } catch(err) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
    }
}

const getRklSnapshotData = async (request, response) => {
    const { address } = request.params;
    const snapshots = await rklSnapshotModel.find({});
    
    return response.json(snapshots);
}

module.exports = {
    getSnapshot,
    getIntelSnapshotDrop1,
    getIntelSnapshotDrop2,
    getIntelSnapshotDrop3,
    getIntelSnapshotList,
    get1226Snapshot,
    get1226SnapshotIndividual,
    getRklSnapshot,
    updateSnapshotClaim
}