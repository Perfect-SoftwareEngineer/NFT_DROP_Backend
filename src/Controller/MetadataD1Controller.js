var {metadataModel} = require('../Model/MetadataD1Model')
var {userModel} = require('../Model/UserModel')
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

    const user = await userModel.find({ wallet: request.wallet });
    if (!user) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('No User');
    }
    if(user[0].role != "admin") {
      return response.status(HttpStatusCodes.BAD_REQUEST).send('You are not allowed to update metadata');
    }

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
    console.log(metadata)
    await metadata.save();
    return response.status(HttpStatusCodes.OK).send(metadata._id);
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

const update = async (request, response) => {
  try {
    const user = await userModel.find({ wallet: request.wallet });
    if (!user) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('No User');
    }
    if(user[0].role != "admin") {
      return response.status(HttpStatusCodes.BAD_REQUEST).send('You are not allowed to update metadata');
    }

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

    metadata[0].name = name;
    metadata[0].description = description;
    metadata[0].image = image;
    metadata[0].externalUrl = externalUrl;

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