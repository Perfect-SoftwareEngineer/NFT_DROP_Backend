const Web3 = require("web3");
var HttpStatusCodes = require('http-status-codes');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const { Moralis }  = require('../Service/MoralisService');
const { snapshotModel } = require('./../Model/1226Snapshot');
const {intelSnapshotDrop1Model} = require('../Model/IntelSnapshotDrop1Model');
const {intelSnapshotDrop2Model} = require('../Model/IntelSnapshotDrop2Model');
const {intelSnapshotDrop3Model} = require('../Model/IntelSnapshotDrop3Model');
const { rklSnapshotModel } = require('./../Model/RKLSnapshot');
const { upload } = require('../Service/S3Service');
const {setBbHolderData, setSerumHolderData, setBbCommunityHolderData, setSerumCommunityHolderData, setIntelHolderData} = require('../Service/SnapshotService');

require("dotenv").config();

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

const setBbSnapshot = async (request, response) => {
  try {
    await setBbHolderData(response);
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

const setSerumSnapshot = async (request, response) => {
  try {
    await setSerumHolderData(response);
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}


const setBbCommunitySnapshot = async (request, response) => {
  try {
    await setBbCommunityHolderData(response)
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

const setSerumCommunitySnapshot = async (request, response) => {
  try {
    await setSerumCommunityHolderData(request, response)
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

const setIntelSnapshotDrop1 = async (request, response) => {
  try {
    await setIntelHolderData("drop1", response);
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

const setIntelSnapshotDrop2 = async (request, response) => {
  try {
    await setIntelHolderData("drop2", response);
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

const setIntelSnapshotDrop3 = async (request, response) => {
  try {
    await setIntelHolderData("drop3", response);
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
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
    setBbSnapshot,
    setSerumSnapshot,
    setBbCommunitySnapshot,
    setSerumCommunitySnapshot,
    setIntelSnapshotDrop1,
    setIntelSnapshotDrop2,
    setIntelSnapshotDrop3,
    getIntelSnapshotList,
    get1226Snapshot,
    get1226SnapshotIndividual,
    getRklSnapshot,
    updateSnapshotClaim
}