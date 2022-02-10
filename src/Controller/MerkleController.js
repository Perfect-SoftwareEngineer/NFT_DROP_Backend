var {intelWhitelistModel} = require('../Model/IntelWhitelistModel')
var HttpStatusCodes = require('http-status-codes');
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { utils, BigNumber } = require("ethers");


const initMerkle = async () => {
    whitelist = await intelWhitelistModel.find({});

    const addresses = [];
    whitelist.map(item => {
        addresses.push(item.wallet);
    })

    const leafNodes = await addresses.map(addr => keccak256(addr));
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
    return merkleTree;
}

const getRoot = async (request, response) => {
  
  const merkleTree = await initMerkle();
  const rootHash = merkleTree.getHexRoot();
  return response.status(HttpStatusCodes.OK).send(rootHash);
}

const getHexProof = async (request, response) => {
    const {wallet} = request.params;
    const merkleTree = await initMerkle();
    const claimingAddress = keccak256(wallet);
    const hexProof = merkleTree.getHexProof(claimingAddress);
    return response.status(HttpStatusCodes.OK).send(hexProof);
}

module.exports = {
    getRoot,
    getHexProof
}