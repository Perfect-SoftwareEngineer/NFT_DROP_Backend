const Web3 = require("web3");
var {sendEmail} = require('./EmailServiceController');
var {holderD1Model} = require('../Model/HolderD1Model')
var {paymentInfoModel} = require('../Model/PaymentInfoModel')
var ERC1155ABI = require('../config/ABI/ERC1155');

require("dotenv").config();

const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.POLYGON_TEST_NODE));

async function watchEtherTransfers() {
	const topic = web3.utils.keccak256('TransferSingle(address,address,address,uint256,uint256)');
	web3.eth.subscribe('logs', {
		address: process.env.DROP1_ADDRESS,
	}, function(error, result){
		if(error){ console.log(error) }
		if (!error && result.topics[0].toLowerCase() == topic) {
			const from = "0x" + result.topics[2].toLowerCase().slice(26, 66);
			const to = "0x" + result.topics[3].toLowerCase().slice(26,66);
			const tokenId = web3.utils.toBN(result.data.toLowerCase().slice(0, 66)).toString();
			const txHash = result.transactionHash;
			handleTx(from, to, tokenId, txHash);
		}
	})
}

async function handleTx(from, to, tokenId, txHash) {
	if(from == process.env.ADMIN_WALLET.toLowerCase()) {
		console.log("admin")
		updatePaymentInfo(to, tokenId, txHash);
	}
	if(web3.utils.toBN(from).toString() != 0) {
		updateDB(from, tokenId);
	}
	if(web3.utils.toBN(to).toString() != 0) {
		updateDB(to, tokenId);
	}
	
}

async function updateDB(wallet, tokenId) {
	const drop1Contract = new web3.eth.Contract(ERC1155ABI, process.env.DROP1_ADDRESS);
	const balance = await drop1Contract.methods.balanceOf(wallet, Number(tokenId)).call();
	const uri = await drop1Contract.methods.uri(Number(tokenId)).call();
	let holder = await holderD1Model.find({wallet: wallet, tokenId: tokenId});
	if (holder.length == 0) {
		const holderdata = new holderD1Model({
			'wallet' : wallet,
			'platform': 'Drop1Nft',
			'contract': process.env.DROP1_ADDRESS,
			tokenId,
			uri,
			'quantity': Number(balance)
		});
		try{ 
			await holderdata.save();
		} catch(err) {
			console.log(err)
		}
	}
	else {
		if(Number(balance) == 0) {
			await holder[0].remove();
		}
		else {
			holder[0].quantity = Number(balance);
			await holder[0].save();
		}
	}
}

async function updatePaymentInfo(to, tokenId, txHash) {
	paymentInfo = await paymentInfoModel.find({wallet: to, tokenId: tokenId.toString(), status : "pending"});
	if(paymentInfo.length > 0) {
		paymentInfo[0]['status'] = "transferred";
		paymentInfo[0]['txHash'] = txHash;
		await paymentInfo[0].save();
		sendEmail(paymentInfo[0]['wallet'], paymentInfo['tokenId'], paymentInfo['txHash']);
	}
}
module.exports = {
	watchEtherTransfers
}