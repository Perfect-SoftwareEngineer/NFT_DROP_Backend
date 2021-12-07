var {subscribeEmailModel} = require('../Model/SubscribeEmailModel')
var HttpStatusCodes = require('http-status-codes');



const getAll = async (request, response) => {
  emails = await subscribeEmailModel.find({});
  if (!emails) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
  return response.status(HttpStatusCodes.OK).send(emails);
}

const create = async (request, response) => {
  try {

    const {
      email
    } = request.body;
    let data = await subscribeEmailModel.find({email: email});
    if(data.length == 0) {
        data = new subscribeEmailModel({email});
        await data.save();
    }
    return response.status(HttpStatusCodes.OK).send("email saved");
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
}

module.exports = {
  getAll,
  create
}