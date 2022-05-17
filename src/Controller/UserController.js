var HttpStatusCodes = require('http-status-codes');
var sigUtil = require('eth-sig-util')
var jwt = require('jsonwebtoken');

const {userModel} = require('../Model/UserModel');
const {verifySignature} = require('../Service/AuthService');

require("dotenv").config();


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

    const user = await userModel.find({ wallet: wallet.toLowerCase() });
    if (user.length == 0) {
      return response.status(HttpStatusCodes.BAD_REQUEST).send('Invalid wallet or signature');
    }
    const verified = verifySignature(user[0]['nonce'], wallet, signature);
    if(verified) {
      const token = jwt.sign(
        { wallet: user[0].wallet },
        process.env.jwtSecret,
        { expiresIn: process.env.jwtExpiration }
      );
      user[0]['nonce'] = Math.floor(Math.random() * 1000000);
      await user[0].save();
      return response.status(HttpStatusCodes.OK).send(token);
    }
    else {
      return response.status(HttpStatusCodes.BAD_REQUEST).send("invalid signature");
    }
    
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
}


const create = async (request, response) => {
  try {
    const { wallet } = request.body;
    const user = await userModel.create({ wallet: wallet.toLowerCase() });

    return response.status(HttpStatusCodes.OK).send(user);
  } catch (err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

const get = async (request, response) => {
  try {
    const { wallet } = request.params;
    const user = await userModel.find({ wallet: wallet.toLowerCase() });

    return response.status(HttpStatusCodes.OK).send(user[0]);
  } catch (err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}
module.exports = {
  signin,
  signup,
  create,
  get
}