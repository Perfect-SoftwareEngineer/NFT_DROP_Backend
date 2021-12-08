var {paymentInfoModel} = require('../Model/PaymentInfoModel')
var HttpStatusCodes = require('http-status-codes');


const get = async (request, response) => {
  const {_id} = request.params;
  paymentInfo = await paymentInfoModel.find({_id: _id});
  if (!paymentInfo) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
  return response.status(HttpStatusCodes.OK).send(paymentInfo);
}

const getAll = async (request, response) => {
  paymentInfo = await paymentInfoModel.find({});
  if (!paymentInfo) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
  return response.status(HttpStatusCodes.OK).send(paymentInfo);
}

const create = async (request, response) => {
  try {
    console.log(request.body);
    const {
      email,
      wallet,
      // tokenId,
      ip,
      country_name
    } = request.body;

    const paymentInfo = new paymentInfoModel({
      email,
      wallet,
      // tokenId,
      status : "pending",
      ip,
      country_name
    });
    await paymentInfo.save();
    return response.status(HttpStatusCodes.OK).send(paymentInfo._id);
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

const update = async (request, response) => {
  try {
    const {
      _id,
      email,
      wallet,
      tokenId,
      status,
      ip,
      country_name
    } = request.body;

    let paymentInfo = await paymentInfoModel.find({_id: _id});
    if (!paymentInfo) {
      return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
    }

    paymentInfo[0].email = email;
    paymentInfo[0].wallet = wallet;
    paymentInfo[0].tokenId = tokenId;
    paymentInfo[0].status = status;
    paymentInfo[0].ip = ip;
    paymentInfo[0].country_name = country_name;

    await paymentInfo[0].save();
    
    return response.status(HttpStatusCodes.OK).send(paymentInfo[0]._id);
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