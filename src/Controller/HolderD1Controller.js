const Web3 = require("web3");
var {holderD1Model} = require('../Model/HolderD1Model')

const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws/v3/2de4d25aeea745b181468b898cf4e899'));

async function watchEtherTransfers() {
	const topic = web3.utils.keccak256('TransferSingle(address,address,address,uint256,uint256)');
	web3.eth.subscribe('logs', {
		address: '0x1E2d9C34c185cCb11c378D6A5fD75886622B6074',
	}, function(error, result){
		if(error){ console.log(error) }
		if (!error && result.topics[0].toLowerCase() == topic) {
			const from = "0x" + result.topics[2].toLowerCase().slice(26, 66);
			const to = "0x" + result.topics[3].toLowerCase().slice(26,66);
			const tokenId = web3.utils.toBN(result.topics[3].toLowerCase()).toString();
			updateDB(from, to, tokenId);
		}
	})
}

async function updateDB(_from, _to, tokenId) {
	// const from = await knex('users').where('wallet', _from.toLowerCase()).select('*');
	// const to = await knex('users').where('wallet', _to.toLowerCase()).select('*');
	// let id;
	// if(to.length == 0) {
	// 	const user = [{
	// 		'fullname': "Anonymous",
	// 		'userid' :  _to.toLowerCase(),
	// 		'email' :  _to.toLowerCase(),
	// 		'ban': false,
	// 		'wallet' : _to.toLowerCase(),
	// 	}];
		
	// 	try{
	// 		id = await knex('users').insert(user).returning('id');
	// 	}
	// 	catch(err) {
	// 		console.log(err);
	// 		return;
	// 	};
	// } else {
	// 	id = to[0].id;
	// }
	// const item = await knex('item').where('token_id', tokenId).select('*');
	// if(item.length > 0) {
	// 	await knex('item').where('token_id', tokenId).update({'owner' : id, 'lazymint': false});
	// }
}
module.exports = {
	watchEtherTransfers
}