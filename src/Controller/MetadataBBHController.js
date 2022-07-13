var Filter = require('bad-words');
var {metadataModel} = require('../Model/MetadataBBHModel')
var HttpStatusCodes = require('http-status-codes');
var {getOwner} = require('../Service/Web3Service')

var filter = new Filter({ replaceRegex: /[A-Za-z0-9\x{f6}\x{d6}\x{c7}\x{e7}\x{15e}\x{15f}\x{11e}\x{11f}\x{130}\x{131}\x{dc}\x{fc}_]/g});

const get = async (request, response) => {
  const {tokenId} = request.params;
  metadata = await metadataModel.find({ tokenId: tokenId});
  if (!metadata) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
  return response.status(HttpStatusCodes.OK).send(metadata[0]);
}

const changeName = async (request, response) => {
  const {wallet, tokenId, name} = request.body;

  if(wallet.toLowerCase() != request.wallet.toLowerCase()) {
    return response.status(HttpStatusCodes.BAD_REQUEST).send("User wallet not matched");
  }

  const isProfane = filter.isProfane(name);
  if (isProfane) {
    return response.status(HttpStatusCodes.BAD_REQUEST).send('Bad word');
  }

  const owner = await getOwner(tokenId);
  if (wallet.toLowerCase() != owner.toLowerCase()) {
    return response.status(HttpStatusCodes.BAD_REQUEST).send('User is not owner of token id');
  }

  metadata = await metadataModel.find({ tokenId: tokenId});
  if (!metadata) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
  metadata[0]['name'] = name;
  await metadata[0].save();
  return response.status(HttpStatusCodes.OK).send(metadata[0]);
}

module.exports = {
  get,
  changeName
}