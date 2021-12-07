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
      tokenId,
      status,
      ip,
      country_name
    } = request.body;

    const paymentInfo = new paymentInfoModel({
      email,
      wallet,
      tokenId,
      status,
      ip,
      country_name
    });
    console.log(paymentInfo)
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

    paymentInfo.email = email;
    paymentInfo.wallet = wallet;
    paymentInfo.tokenId = tokenId;
    paymentInfo.status = status;
    paymentInfo.ip = ip;
    paymentInfo.country_name = country_name;

    await paymentInfo.save();
    
    return response.status(HttpStatusCodes.OK).send(paymentInfo._id);
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