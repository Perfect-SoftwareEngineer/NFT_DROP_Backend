var {metadataModel} = require('../Model/MetadataIntelModel')
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

const getAll = async (request, response) => {
  metadata = await metadataModel.find({});
  if (!metadata) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
  return response.status(HttpStatusCodes.OK).send(metadata);
}

const create = async (request, response) => {
  try {

    const {
      name,
      description,
      image,
      externalUrl,
      animationUrl,
      tokenId,
      feeRecipient
    } = request.body;

    const metadata = new metadataModel({
      name,
      description,
      image,
      external_url: externalUrl,
      animation_url: animationUrl,
      tokenId: tokenId,
      fee_recipient: feeRecipient
    });
    await metadata.save();
    return response.status(HttpStatusCodes.OK).send(metadata._id);
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

const update = async (request, response) => {
  try {

    const {
      name,
      description,
      image,
      externalUrl,
      animationUrl,
      tokenId,
    } = request.body;

    let metadata = await metadataModel.find({tokenId: tokenId});
    if (!metadata) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
    }

    metadata[0].name = name;
    metadata[0].description = description;
    metadata[0].image = image;
    metadata[0].external_url = externalUrl;
    metadata[0].animation_url = animationUrl;
    await metadata[0].save();
    
    return response.status(HttpStatusCodes.OK).send(metadata[0]._id);
  } catch(err) {
    console.log(err)
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
}

module.exports = {
  get,
  getAll,
  create,
  update
}