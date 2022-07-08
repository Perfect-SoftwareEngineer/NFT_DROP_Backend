var {metadataModel} = require('../Model/MetadataBBHModel')
var {userModel} = require('../Model/UserModel')
var HttpStatusCodes = require('http-status-codes');


const get = async (request, response) => {
  const {tokenId} = request.params;
  metadata = await metadataModel.find({ tokenId: tokenId});
  if (!metadata) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
  return response.status(HttpStatusCodes.OK).send(metadata[0]);
}

module.exports = {
  get
}