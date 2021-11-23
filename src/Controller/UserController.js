var HttpStatusCodes = require('http-status-codes');
var sigUtil = require('eth-sig-util')
var jwt = require('jsonwebtoken');

var {userModel} = require('../Model/UserModel')

require("dotenv").config();


const DOMAIN_TYPE = [
  {
    type: "string",
    name: "name"
  }
];

const signData = {
  types: Object.assign(
    {
      EIP712Domain: DOMAIN_TYPE
    },
    {
      Sign: []
    }
  ),
  domain: {
    name: "sign"
  },
  primaryType: "Sign",
  message: {}
}

const signup = async (request, response) => {
  try {

    const {
      wallet,
      signature
    } = request.body;
    const msgSender = sigUtil.recoverTypedSignature_v4({ data: signData, sig: signature })
    if(wallet.toLowerCase() != msgSender) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send('Invalid signature');
    }
    const user = new userModel({
      wallet,
      signature,
      'role' : 'user'
    })

    await user.save();
    return response.status(HttpStatusCodes.OK).send(user._id);
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
}

const signin = async (request, response) => {
  try {

    const {
      wallet,
      signature
    } = request.body;

    const msgSender = sigUtil.recoverTypedSignature_v4({ data: signData, sig: signature })
    if(wallet.toLowerCase() != msgSender) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send('Invalid signature');
    }

    const user = await userModel.find({ wallet, signature });
    if (!user) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send('Invalid wallet or signature');
    }
    const token = jwt.sign(
      { wallet: user[0].wallet },
      process.env.jwtSecret,
      { expiresIn: process.env.jwtExpiration }
    );
    return response.status(HttpStatusCodes.OK).send(token);
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
}

module.exports = {
  signin,
  signup
  
}