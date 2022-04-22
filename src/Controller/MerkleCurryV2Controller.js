var {freeBBModel} = require('../Model/FreeBBModel')
var HttpStatusCodes = require('http-status-codes');
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { utils, BigNumber } = require("ethers");


const initMerkleSingle = async (gameId) => {
    whitelist = await freeBBModel.find({game_id : gameId});

    const addresses = [];
    whitelist.map(item => {
        addresses.push(item.wallet);
    })
    const leafNodes = await addresses.map(addr => keccak256(addr));
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
    return merkleTree;
}

const getBBRoot = async (gameId) => {
    
    const merkleTree = await initMerkleSingle(gameId);
    const rootHash = merkleTree.getHexRoot();
    return rootHash;
}

const getBBHexProof = async (request, response) => {
    const {gameId, wallet} = request.params;
    const merkleTree = await initMerkleSingle(gameId);
    const claimingAddress = keccak256(wallet);
    const hexProof = merkleTree.getHexProof(claimingAddress);
    return response.status(HttpStatusCodes.OK).send(hexProof);
}

module.exports = {
    getBBRoot,
    getBBHexProof
}