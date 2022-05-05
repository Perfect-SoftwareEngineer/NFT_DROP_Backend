const Web3 = require("web3");
const BBHABI = require('../config/ABI/BasketBallHead');
var {freeBBModel} = require('../Model/FreeBBModel')

require("dotenv").config();

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETHEREUM_HTTP_NODE));

async function watchClaim(gameId, wallet) {
    console.log("claim status double check")
    const beneficiary = web3.utils.toChecksumAddress(wallet);
    const contractAddress = process.env.NODE_ENV === 'production' ? process.env.BBH_ADDRESS : process.env.BBH_TEST_ADDRESS;
	const contract = new web3.eth.Contract(BBHABI, contractAddress);
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

module.exports = {
    watchClaim
}