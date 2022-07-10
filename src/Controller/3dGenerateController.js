
var HttpStatusCodes = require('http-status-codes');
const {MixologyService} = require('../Service/MixologyService')
const {checkBalance} = require('../Service/Web3Service');
var mixologyService = new MixologyService();

const create = async (request, response) => {
  const {wallet, serumIds} = request.body;
  
  if(wallet.toLowerCase() != request.wallet.toLowerCase()) {
    return response.status(HttpStatusCodes.BAD_REQUEST).send("User wallet not matched");
  }
  try{
    const hasNft = await checkBalance(wallet, serumIds);
    if(!hasNft) 
      return response.status(HttpStatusCodes.BAD_REQUEST).send("No basketball or serum exist in user's wallet");

    const tokenId = await mixologyService.createMetadata(wallet, serumIds);
    return response.status(HttpStatusCodes.OK).send({tokenId});
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

const addFailedIds = async (request, response) => {
  const {tokenIds} = request.body;
  try{
    await mixologyService.addFailedIds(tokenIds);
    return response.status(HttpStatusCodes.OK).send("done");
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

module.exports = {
  create,
  addFailedIds
}
