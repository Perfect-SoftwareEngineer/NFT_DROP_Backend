const Web3 = require("web3");
var HttpStatusCodes = require('http-status-codes');
var ERC1155ABI = require('../config/ABI/ERC1155');
var {paymentInfoModel} = require('../Model/PaymentInfoModel')
require("dotenv").config();

const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws/v3/2de4d25aeea745b181468b898cf4e899'));


const getTokenId = async (request, response) => {
  const {id} = request.body;
  const drop1Contract = new web3.eth.Contract(ERC1155ABI, "0x7C9A41EFd71b1942c222058DB93C5685bA1D97fB");
  const tokenIds = [];
  for(let i = 1; i <= 5; i ++) {
    const balance = await drop1Contract.methods.balanceOf(process.env.ADMIN_WALLET, i).call();
    if(Number(balance) > 0)
      tokenIds.push(i);
  }
  const tokenId = tokenIds[Math.floor(Math.random()*tokenIds.length)];
  paymentInfo = await paymentInfoModel.find({_id: id});
  if(paymentInfo.length > 0) {
    paymentInfo[0]['tokenId'] = tokenId;
    await paymentInfo[0].save();
  }
  return response.status(HttpStatusCodes.OK).send(tokenId.toString());
}

const get = async (request, response) => {
  const {_id} = request.params;
  paymentInfo = await paymentInfoModel.find({_id: _id});
  if (!paymentInfo) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
  return response.status(HttpStatusCodes.OK).send(paymentInfo[0]);
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
    const {
      email,
      wallet,
      ip,
      country_name
    } = request.body;

    const paymentInfo = new paymentInfoModel({
      email,
      wallet: wallet.toLowerCase(),
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
  getTokenId,
  get,
  getAll,
  create,
  update
}