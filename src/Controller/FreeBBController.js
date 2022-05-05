var {freeBBModel} = require('../Model/FreeBBModel')
var {currentWarriorsMatchModel} = require("../Model/CurrentWarriorsMatchModel");
var {watchClaim} = require('../Service/Web3Service');
var HttpStatusCodes = require('http-status-codes');


const get = async (request, response) => {
  const {gameId, wallet} = request.params;
  const userBB = await freeBBModel.find({ game_id: parseInt(gameId), wallet: wallet.toLowerCase()}).limit(1);
  if(userBB.length > 0) {
    return response.status(HttpStatusCodes.OK).send(userBB);
  }
  const freeBB = await freeBBModel.find({ game_id: parseInt(gameId), wallet: "0x"}).limit(1);
  if (!freeBB) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
  return response.status(HttpStatusCodes.OK).send(freeBB);
}

const getCount = async (request, response) => {
  const {gameId} = request.params;
  const currentMatch = await currentWarriorsMatchModel.find({game_id: parseInt(gameId)});
  if(currentMatch.length == 0) {
    return response.status(HttpStatusCodes.OK).send([0, 0]);
  } 
  else {
    const freeBB = await freeBBModel.find({ game_id: parseInt(gameId), wallet: "0x"});
    if (!freeBB) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
    }
    const tpm = parseInt(currentMatch[0]['tpm']);
    const freeBBCount = currentMatch[0]['merkled'] ? 0 : freeBB.length;
    return response.status(HttpStatusCodes.OK).send([tpm, freeBBCount]);
  }
  
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
  const currentMatch = await currentWarriorsMatchModel.find({merkled: false});
  const gameId = currentMatch.length > 0 ? currentMatch[0]['game_id'] : 0;
  const freeBB = await freeBBModel.find({ claimed: false, wallet: wallet.toLowerCase(), game_id: {$not: {$eq: gameId}} });
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


const claimStarted = async (request, response) => {
  try {

    const {
      gameId,
      wallet
    } = request.body;

    setTimeout(watchClaim, 180000, gameId, wallet)
    return response.status(HttpStatusCodes.OK).send("ok");
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
  getCount,
  getAll,
  getUnclaimed,
  reserve,
  claimStarted,
  claim
}