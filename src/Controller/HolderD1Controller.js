const Web3 = require("web3");
var {sendEmail} = require('./EmailServiceController');
var {paymentInfoModel} = require('../Model/PaymentInfoModel')

require("dotenv").config();


const polygonNode = process.env.NODE_ENV == 'production' ? process.env.POLYGON_NODE : process.env.POLYGON_TEST_NODE;
const web3 = new Web3(new Web3.providers.WebsocketProvider(polygonNode));

async function watchEtherTransfers() {
	const topic = web3.utils.keccak256('TransferSingle(address,address,address,uint256,uint256)');
	web3.eth.subscribe('logs', {
		address: process.env.NODE_ENV == 'production' ? process.env.DROP1_ADDRESS : process.env.DROP1_ADDRESS_TEST,
	}, function(error, result){
		if(error){ console.log(error) }
		if (!error && result.topics[0].toLowerCase() == topic) {
			const from = "0x" + result.topics[2].toLowerCase().slice(26, 66);
			const to = "0x" + result.topics[3].toLowerCase().slice(26,66);
			const tokenId = web3.utils.toBN(result.data.toLowerCase().slice(0, 66)).toString();
			const txHash = result.transactionHash;
			if(from == process.env.ADMIN_WALLET.toLowerCase()) {
				updatePaymentInfo(to, tokenId, txHash);
			}
		}
	})
}


async function updatePaymentInfo(to, tokenId, txHash) {
	paymentInfo = await paymentInfoModel.find({wallet: to, tokenId: tokenId.toString(), status : "pending"});
	if(paymentInfo.length > 0) {
		paymentInfo[0]['status'] = "transferred";
		paymentInfo[0]['txHash'] = txHash;
		await paymentInfo[0].save();
		sendEmail(paymentInfo[0]['email'], paymentInfo['txHash']);
	}
}
module.exports = {
	watchEtherTransfers
}