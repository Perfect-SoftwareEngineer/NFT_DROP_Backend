const Web3 = require("web3");
var HttpStatusCodes = require('http-status-codes');
const sgMail = require("@sendgrid/mail");
const {Moralis}  = require('./MoralisController');
var {paymentInfoModel} = require('../Model/PaymentInfoModel')
var {sendEmail} = require('./EmailServiceController');
var ERC1155ABI = require('../config/ABI/ERC1155');

require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const web3 = new Web3(new Web3.providers.HttpProvider(process.env.NODE_ENV == 'production' ? process.env.POLYGON_HTTP_NODE : process.env.POLYGON_HTTP_TEST_NODE));

const getTokenId = async (request, response) => {
  const {id} = request.body;
  const drop1Contract = new web3.eth.Contract(ERC1155ABI, process.env.NODE_ENV == 'production' ? process.env.DROP1_ADDRESS : process.env.DROP1_ADDRESS_TEST);
  const tokenIds = [];
  for(let i = 1; i <= 5; i ++) {
    const balance = await drop1Contract.methods.balanceOf(process.env.ADMIN_WALLET, i).call();
    if(Number(balance) > 0)
      tokenIds.push(i);
  }
  let tokenId = tokenIds[Math.floor(Math.random()*tokenIds.length)];
  paymentInfo = await paymentInfoModel.find({_id: id});
  if(paymentInfo.length > 0) {
    paymentInfo[0]['tokenId'] = tokenId;
    await paymentInfo[0].save();
  }
  tokenId = tokenId == undefined ? '0' : tokenId.toString();
  return response.status(HttpStatusCodes.OK).send(tokenId);
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

const getCount = async (request, response) => {
  const count = await paymentInfoModel.count();
  return response.status(HttpStatusCodes.OK).send(JSON.stringify({'count': count}));
}

const create = async (request, response) => {
  try {
    const {
      email,
      wallet,
      ip,
      country_name,
      date
    } = request.body;
    if(request.email == email) {
      const paymentInfo = new paymentInfoModel({
        email,
        wallet: wallet.toLowerCase(),
        status : "pending",
        ip,
        country_name,
        date
      });
      await paymentInfo.save();
  
      const data= {
        to: email,
        from: 'contact@lunamarket.io',
        templateId: process.env.SENDGRID_ORDER_CONFIRMATION_TRANSACTION_ID,
        dynamic_template_data: {
          "person_name": "",
          "time": date,
          "username": "",
          "amount": "$333.00",
          "sub_total_amount": "$333.00",
          "wallet_address": wallet
        }
      };
      sgMail.send(data);
      return response.status(HttpStatusCodes.OK).send(paymentInfo._id);
    }
    else {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("auth token incorrect");  
    }
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

function sleep(milliseconds) {  
  return new Promise(resolve => setTimeout(resolve, milliseconds));  
}  

const update = async (request, response) => {
  try {
    const {
      txHash
    } = request.body;
    await sleep(3000);
    const topic = "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62";
    const transaction = await web3.eth.getTransactionReceipt(txHash);
    if (transaction.logs[0].topics[0].toLowerCase() == topic) {
			const from = "0x" + transaction.logs[0].topics[2].toLowerCase().slice(26, 66);
			const to = "0x" + transaction.logs[0].topics[3].toLowerCase().slice(26,66);
			const tokenId = web3.utils.toBN(transaction.logs[0].data.toLowerCase().slice(0, 66)).toString();
			paymentInfo = await paymentInfoModel.find({wallet: to, tokenId: tokenId.toString(), status : "pending"});
      if(paymentInfo.length > 0) {
        paymentInfo[0]['status'] = "transferred";
        paymentInfo[0]['txHash'] = txHash;
        await paymentInfo[0].save();
        
        sendEmail(paymentInfo[0]['email'], paymentInfo[0]['txHash']);
      }
      return response.status(HttpStatusCodes.OK).send("ok");
		}
  } catch(err) {
    console.error(err);
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

module.exports = {
  getTokenId,
  get,
  getAll,
  getCount,
  create,
  update
}