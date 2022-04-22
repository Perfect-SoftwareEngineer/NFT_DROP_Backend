var {freeBBModel} = require('../Model/FreeBBModel')
var { currentWarriorsMatchModel } = require("../Model/CurrentWarriorsMatchModel");
var HttpStatusCodes = require('http-status-codes');


const get = async (request, response) => {
  const {gameId} = request.params;
  const freeBB = await freeBBModel.find({ game_id: parseInt(gameId), wallet: "0x"}).limit(1);
  if (!freeBB) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
  return response.status(HttpStatusCodes.OK).send(freeBB);
}

const getWinner = async (request, response) => {
  const {gameId} = request.params;
  const freeBB = await freeBBModel.find({ game_id: parseInt(gameId), wallet: {$not: {$eq: "0x"}}});
  if (!freeBB) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
  return response.status(HttpStatusCodes.OK).send(freeBB);
}

const getUnclaimed = async (request, response) => {
  const {wallet} = request.params;
  const freeBB = await freeBBModel.find({ claimed: false, wallet: wallet.toLowerCase()}).limit(1);
  if (!freeBB) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
  return response.status(HttpStatusCodes.OK).send(freeBB);
}

const getAll = async (request, response) => {
  const freeBB = await freeBBModel.find({});
  if (!freeBB) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
  return response.status(HttpStatusCodes.OK).send(freeBB);
}

const reserve = async (request, response) => {
  try {

    const {
      _id,
      gameId,
      wallet
    } = request.body;

    let freeBB = await freeBBModel.findById(_id);
    const currentMatch = await currentWarriorsMatchModel.find({game_id: parseInt(gameId), merkled: false});
    if(currentMatch.length == 0) 
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Invalid gameId or merkle tree already generated');
    if (!freeBB) 
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Invalid BB id');
    if(freeBB['wallet'] != "0x") 
      return response.status(HttpStatusCodes.BAD_REQUEST).send('BB is already allocated to other wallet');
    else{
      const existBB = await freeBBModel.find({game_id: freeBB['game_id'], wallet: wallet.toLowerCase()});
      if(existBB.length > 0)
        return response.status(HttpStatusCodes.BAD_REQUEST).send('This wallet is already has free BB');
      else {
        freeBB['wallet'] = wallet.toLowerCase();
        await freeBB.save();
        return response.status(HttpStatusCodes.OK).send(freeBB._id);
      }
    }
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}


const claim = async (request, response) => {
  try {

    const {
      _id
    } = request.body;

    let freeBB = await freeBBModel.findById(_id);
    if (!freeBB) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Invalid BB id');
    }
    if(freeBB['wallet'] == "0x") 
      return response.status(HttpStatusCodes.BAD_REQUEST).send('BB is not allocated');
    else{
      freeBB['claimed'] = true;
      await freeBB.save();
      return response.status(HttpStatusCodes.OK).send(freeBB._id);
    }
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

module.exports = {
  get,
  getWinner,
  getAll,
  getUnclaimed,
  reserve,
  claim
}