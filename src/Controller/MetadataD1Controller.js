var {metadataModel} = require('../Model/MetadataD1Model')
var HttpStatusCodes = require('http-status-codes');


const get = async (request, response) => {
  const {tokenId} = request.params;
  metadata = await metadataModel.find({ tokenId: tokenId});
  if (!metadata) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
  return response.status(HttpStatusCodes.OK).send(metadata);
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
      tokenId,
    } = request.body;

    const metadata = new metadataModel({
      name,
      description,
      image,
      externalUrl,
      tokenId
    });

    await metadata.save();
    return response.status(HttpStatusCodes.OK).send(metadata._id);
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
}

const update = async (request, response) => {
  try {

    const {
      name,
      description,
      image,
      externalUrl,
      tokenId,
    } = request.body;

    let metadata = await metadataModel.find({tokenId: tokenId});
    if (!metadata) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
    }

    metadata.name = name;
    metadata.description = description;
    metadata.image = image;
    metadata.externalUrl = externalUrl;

    await metadata.save();
    
    return response.status(HttpStatusCodes.OK).send(metadata._id);
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
}

module.exports = {
  get,
  getAll,
  create,
  update
}