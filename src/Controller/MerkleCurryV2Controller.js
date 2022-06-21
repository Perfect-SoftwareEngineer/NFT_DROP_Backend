var HttpStatusCodes = require('http-status-codes');
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { utils, BigNumber } = require("ethers");
var {freeBBModel} = require('../Model/FreeBBModel')
const {bbGCFSnapshotModel} = require('../Model/BbGCFSnapshotModel');
const {bbCommunitySnapshotModel} = require('../Model/BbCommunitySnapshotModel');
const {serumGCFSnapshotModel} = require('../Model/SerumGCFSnapshotModel');
const {serumCommunitySnapshotModel} = require('../Model/SerumCommunitySnapshotModel');

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

const initMerkleMultiple = async (data, nft) => {
    let leafNodes;
    if(nft == 'Basketball') {
        try{
            leafNodes = await data.map((node) => {
                return utils.solidityKeccak256( ["address", "uint"], [node['address'], parseInt(node['quantity'])]);
            });
        } catch(err) {console.log(err)}
    } else {
        leafNodes = await data.map((node) => {
            return utils.solidityKeccak256( ["address", "uint", "uint"], [node['address'], parseInt(node['token_id']), parseInt(node['quantity'])]);
        });
    }
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
    return merkleTree;
}

const getBbRoot = async (gameId) => {
    const merkleTree = await initMerkleSingle(gameId);
    const rootHash = merkleTree.getHexRoot();
    return rootHash;
}

const getBbHexProof = async (request, response) => {
    const {gameId, wallet} = request.params;
    const merkleTree = await initMerkleSingle(gameId);
    const claimingAddress = keccak256(wallet);
    const hexProof = merkleTree.getHexProof(claimingAddress);
    return response.status(HttpStatusCodes.OK).send(hexProof);
}

const getBbGCFRoot = async (request, response) => {
    const gcfData = await bbGCFSnapshotModel.find({}).sort({createdAt: 1});
    const merkleTree = await initMerkleMultiple(gcfData, "Basketball");
    const rootHash = merkleTree.getHexRoot();
    return response.status(HttpStatusCodes.OK).send(rootHash);
}


const getBbGCFHexProof = async (request, response) => {
    const {wallet} = request.params;
    const userData = await bbGCFSnapshotModel.find({address: wallet.toLowerCase(), claimed: false});
    if(userData.length == 0) {
        return response.status(HttpStatusCodes.OK).send({
            quantity: 0,
            hexProof: []
        });
    } else {
        const gcfData = await bbGCFSnapshotModel.find({}).sort({createdAt: 1});
        const merkleTree = await initMerkleMultiple(gcfData, "Basketball");
        const claimingAddress = utils.solidityKeccak256(["address", "uint"],[userData[0]['address'], parseInt(userData[0]['quantity'])]);
        const hexProof = merkleTree.getHexProof(claimingAddress);
        return response.status(HttpStatusCodes.OK).send({
            quantity: parseInt(userData[0]['quantity']),
            hexProof: hexProof
        });
    }
}

const bbGcfClaim = async (request, response) => {
    const {wallet} = request.body;
    if(wallet.toLowerCase() != request.wallet.toLowerCase()) {
        return response.status(HttpStatusCodes.BAD_REQUEST).send("User wallet not matched");
    }
    const userData = await bbGCFSnapshotModel.find({address: wallet.toLowerCase(), claimed: false});
    if(userData.length == 0) {
        return response.status(HttpStatusCodes.BAD_REQUEST).send("no data");
    } else {
        userData[0]['claimed'] = true;
        await userData[0].save();
        return response.status(HttpStatusCodes.OK).send("Success");
    }
}

const getBbCommunityRoot = async (request, response) => {
    const communityData = await bbCommunitySnapshotModel.find({}).sort({createdAt: 1});
    const merkleTree = await initMerkleMultiple(communityData, "Basketball");
    const rootHash = merkleTree.getHexRoot();
    return response.status(HttpStatusCodes.OK).send(rootHash);
}


const getBbCommunityHexProof = async (request, response) => {
    const {wallet} = request.params;
    const userData = await bbCommunitySnapshotModel.find({address: wallet.toLowerCase(), claimed: false});
    if(userData.length == 0) {
        return response.status(HttpStatusCodes.OK).send({
            quantity: 0,
            hexProof: []
        });
    } else {
        const communityData = await bbCommunitySnapshotModel.find({}).sort({createdAt: 1});
        const merkleTree = await initMerkleMultiple(communityData, "Basketball");
        const claimingAddress = utils.solidityKeccak256(["address", "uint"],[userData[0]['address'], parseInt(userData[0]['quantity'])]);
        const hexProof = merkleTree.getHexProof(claimingAddress);
        return response.status(HttpStatusCodes.OK).send({
            quantity: parseInt(userData[0]['quantity']),
            hexProof: hexProof
        });
    }
}

const bbCommunityClaim = async (request, response) => {
    const {wallet} = request.body;
    if(wallet.toLowerCase() != request.wallet.toLowerCase()) {
        return response.status(HttpStatusCodes.BAD_REQUEST).send("User wallet not matched");
    }
    const userData = await bbCommunitySnapshotModel.find({address: wallet.toLowerCase(), claimed: false});
    if(userData.length == 0) {
        return response.status(HttpStatusCodes.BAD_REQUEST).send("no data");
    } else {
        userData[0]['claimed'] = true;
        await userData[0].save();
        return response.status(HttpStatusCodes.OK).send("Success");
    }
}

const getSerumGCFRoot = async (request, response) => {
    const gcfData = await serumGCFSnapshotModel.find({}).sort({createdAt: 1});
    const merkleTree = await initMerkleMultiple(gcfData, "Serum");
    const rootHash = merkleTree.getHexRoot();
    return response.status(HttpStatusCodes.OK).send(rootHash);
}


const getSerumGCFHexProof = async (request, response) => {
    const {wallet} = request.params;
    const userData = await serumGCFSnapshotModel.find({address: wallet.toLowerCase(), claimed: false});
    if(userData.length == 0) {
        return response.status(HttpStatusCodes.OK).send({});
    } else {
        const gcfData = await serumGCFSnapshotModel.find({}).sort({createdAt: 1});
        const merkleTree = await initMerkleMultiple(gcfData, "Serum");
        const result = {};
        userData.map(data => {
            const claimingAddress = utils.solidityKeccak256(["address", "uint", "uint"],[data['address'], parseInt(data['token_id']), parseInt(data['quantity'])]);
            const hexProof = merkleTree.getHexProof(claimingAddress);
            result[parseInt(data['token_id'])] = {
                quantity: parseInt(data['quantity']),
                hexProof: hexProof
            }
        })
        
        return response.status(HttpStatusCodes.OK).send(result);
    }
}

const getSerumCommunityRoot = async (request, response) => {
    const communityData = await serumCommunitySnapshotModel.find({}).sort({createdAt: 1});
    const merkleTree = await initMerkleMultiple(communityData, "Serum");
    const rootHash = merkleTree.getHexRoot();
    return response.status(HttpStatusCodes.OK).send(rootHash);
}


const getSerumCommunityHexProof = async (request, response) => {
    const {wallet} = request.params;
    const userData = await serumCommunitySnapshotModel.find({address: wallet.toLowerCase(), claimed: false});
    if(userData.length == 0) {
        return response.status(HttpStatusCodes.OK).send({});
    } else {
        const communityData = await serumCommunitySnapshotModel.find({}).sort({createdAt: 1});
        const merkleTree = await initMerkleMultiple(communityData, "Serum");
        const result = {};
        userData.map(data => {
            const claimingAddress = utils.solidityKeccak256(["address", "uint", "uint"],[data['address'], parseInt(data['token_id']), parseInt(data['quantity'])]);
            const hexProof = merkleTree.getHexProof(claimingAddress);
            result[parseInt(data['token_id'])] = {
                quantity: parseInt(data['quantity']),
                hexProof: hexProof
            }
        })
        
        return response.status(HttpStatusCodes.OK).send(result);
    }
}

module.exports = {
    getBbRoot,
    getBbGCFRoot,
    getBbCommunityRoot,
    getBbHexProof,
    getBbGCFHexProof,
    getBbCommunityHexProof,
    bbGcfClaim,
    bbCommunityClaim,
    getSerumGCFRoot,
    getSerumCommunityRoot,
    getSerumGCFHexProof,
    getSerumCommunityHexProof,
}