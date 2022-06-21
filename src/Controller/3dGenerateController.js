
var HttpStatusCodes = require('http-status-codes');
const {MixologyService} = require('../Service/MixologyService')

var mixologyService = new MixologyService();

const create = async (request, response) => {
  try{
    await mixologyService.createMetadata(request);
    return response.status(HttpStatusCodes.OK).send("done");
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

module.exports = {
  create
}