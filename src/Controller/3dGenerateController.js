
var HttpStatusCodes = require('http-status-codes');
const csvjson = require('csvjson');
var {ftxCodeModel} = require('../Model/FtxCodeModel')
var {ftxStatusModel} = require('../Model/FtxStatusModel')
const {bbCommunitySnapshotModel} = require('../Model/BbCommunitySnapshotModel'); 


const create = async (request, response) => {
  const {wallet, code} = request.body;
  if(wallet.toLowerCase() != request.wallet.toLowerCase()) {
    return response.status(HttpStatusCodes.BAD_REQUEST).send("User wallet not matched");
  }
  try{
    const status = await ftxStatusModel.find().limit(1);
    if(status.length == 0 || !status[0].status)
      return response.status(HttpStatusCodes.BAD_REQUEST).send("ftx disabled");
    const data = await ftxCodeModel.find({ code: code.toLowerCase()});
    if(data.length == 0) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("Code invalid");
    } 
    else {
      if(data[0]['address'] != "0x")
        return response.status(HttpStatusCodes.BAD_REQUEST).send("Code already used");
      else {
        data[0]['address'] = wallet.toLowerCase();
        await data[0].save();
        const snapshots = await bbCommunitySnapshotModel.find({address: wallet.toLowerCase()})
        if(snapshots.length == 0) {
          const snapshot = new bbCommunitySnapshotModel({
            address: wallet.toLowerCase(),
            quantity: 1
          })
          await snapshot.save();
          console.log("jere")
        }
        else{
          snapshots[0]['quantity'] = parseInt(snapshots[0]['quantity']) + 1;
          await snapshots[0].save()
        }
        return response.status(HttpStatusCodes.OK).send(data[0]);
      }
    }
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
  
}

module.exports = {
  create
}