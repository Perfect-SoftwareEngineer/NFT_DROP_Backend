var { currentWarriorsMatchModel } = require("../Model/CurrentWarriorsMatchModel");
var HttpStatusCodes = require('http-status-codes');


const get = async (request, response) => {
  const matches = await currentWarriorsMatchModel.find().sort({updatedAt: -1}).limit(1);
  if (!matches) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
  return response.status(HttpStatusCodes.OK).send(matches);
}


module.exports = {
  get
}