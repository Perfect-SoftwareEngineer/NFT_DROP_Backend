const Web3 = require("web3");
const BBABI = require('../config/ABI/BasketBall');
const serumABI = require('../config/ABI/Serum');
const BBHABI = require('../config/ABI/BasketBallHead');
var {freeBBModel} = require('../Model/FreeBBModel')

require("dotenv").config();

const node = process.env.NODE_ENV === 'production' ? process.env.ETHEREUM_HTTP_NODE : process.env.ETHEREUM_HTTP_TEST_NODE
const web3 = new Web3(new Web3.providers.HttpProvider(node));

async function watchClaim(gameId, wallet) {
    console.log("claim status double check")
    const beneficiary = web3.utils.toChecksumAddress(wallet);
    const contractAddress = process.env.NODE_ENV === 'production' ? process.env.BB_ADDRESS : process.env.BB_TEST_ADDRESS;
	const contract = new web3.eth.Contract(BBABI, contractAddress);
    contract.getPastEvents('claimedFromThreePoint', {
        fromBlock: 14699425,
        toBlock: 'latest'
    })
    .then(async function(events){
        result = events.filter(event => event.returnValues.gameId == parseInt(gameId) && event.returnValues.beneficiary == beneficiary)
        if(result.length > 0) {
            const userBB = await freeBBModel.find({ game_id: parseInt(gameId), wallet: wallet.toLowerCase()}).limit(1);
            if(userBB.length > 0) {
                userBB[0]['claimed'] = true;
                await userBB[0].save();
            }
        }
    });
}

async function checkBalance(wallet, serumIds) {
    if(serumIds.length > 3)
        return false;
    const bbAddress = process.env.NODE_ENV === 'production' ? process.env.BB_ADDRESS : process.env.BB_TEST_ADDRESS;
	const bbContract = new web3.eth.Contract(BBABI, bbAddress);
    const bbBalance = await bbContract.methods.balanceOf(wallet, '1').call();
    if(bbBalance == 0) 
        return false;

    const serumAddress = process.env.NODE_ENV === 'production' ? process.env.SERUM_ADDRESS : process.env.SERUM_TEST_ADDRESS;
	const serumContract = new web3.eth.Contract(serumABI, serumAddress);
    for(let i = 0; i < serumIds.length; i ++) {
        const balance = await serumContract.methods.balanceOf(wallet, serumIds[i]).call();
        if(balance == 0)
            return false;
    }

    return true;
}

async function getOwner(tokenId) {
    try{
        const bbhAddress = process.env.NODE_ENV === 'production' ? process.env.BBH_ADDRESS : process.env.BBH_TEST_ADDRESS;
        const bbhContract = new web3.eth.Contract(BBHABI, bbhAddress);
        const owner = await bbhContract.methods.ownerOf(tokenId).call();
        return owner;
    } catch(err) {
        return "0x";
    }
}

async function exists(tokenId) {
    try{
        const network = process.env.NODE_ENV === 'production' ? 'mainnet' : 'rinkeby';

        const web3_ = new Web3(new Web3.providers.HttpProvider(`https://${network}.infura.io/v3/${process.env.INFURA_KEY}`));
        const bbhAddress = process.env.NODE_ENV === 'production' ? process.env.BBH_ADDRESS : process.env.BBH_TEST_ADDRESS;
        const bbhContract = new web3_.eth.Contract(BBHABI, bbhAddress);
        const result = await bbhContract.methods.exists(tokenId).call();
        return result;
    } catch(err) {
        console.log(err)
        return false;
    }
}

module.exports = {
    watchClaim,
    checkBalance,
    getOwner,
    exists
}