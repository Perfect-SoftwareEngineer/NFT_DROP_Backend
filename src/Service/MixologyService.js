
const Chance = require('chance');

const fs = require('fs');

require("dotenv").config();


const {traitAssetsModel} = require('../Model/TraitAssetsModel');
const {metadataModel} = require('../Model/MetadataBBHModel');
const traitJson = require('../constants/Trait.json');
const serumJson = require('../constants/Serum.json');
const {processJob} = require('./RedisService');
const {uploadImage} = require('./S3Service');
const {QueueService} = require('./QueueService');

class MixologyService {
    constructor(){
        this.chance = new Chance();
        this.queueOne = new QueueService(1);
        this.queueTwo = new QueueService(2);
        this.lastQueue = 0;

        traitAssetsModel.find({})
        .then(result => this.traitAssets = result)

        this.mixImageContent = fs.readFileSync(`./src/constants/mix.png`);
    }

    // internal 
    removeFromArray(value, list) {
        list = list.filter(item => item != value)
        return list;
    }
    random (items) {
        var item = items[Math.floor(Math.random()*items.length)];
        return item;
    }

    randomRarityByWeight() {
        const rarity = this.chance.weighted(['common', 'rare', 'epic', 'legendary'], [200, 50, 10, 1])
        return rarity;
    }

    generateTokenId() {
        let minm = 10000000000000000000;
        let maxm = 99999999999999999999;
        return parseInt(Math.floor(Math
        .random() * (maxm - minm + 1)) + minm);
    }

    saveMetadata(tokenId, imageMetadata) {

        const metadata = new metadataModel({
            name: `Basketball Headz #${tokenId}`,
            description: "Curry brand is unifying basketball and positive communities across the Metaverse.\nIntroducing Basketball Headz - a limited-edition 3D generative NFT project that unifies multiple communities to mix and match your favorite NFT traits.\nBy owning this NFT, you agree to all the terms and conditions under lab.currybrand.com/legal/nft-ownership-agreement",
            image: "",
            external_url: "",
            animation_url: "https://luna-bucket.s3.us-east-2.amazonaws.com/mixology.gif",
            tokenId: tokenId,
            fee_recipient: process.env.ADMIN_WALLET,
            attributes: imageMetadata
        });
        metadata.save();
    }

    generateImageMetadata(data){
        const attributes = []
        const attributesDb = []
        for (const key in data) {
            const traitType = traitJson[key].replace(/ /gi, '_');
            const serumId = data[key]['serumId']
            const rarity =  data[key]['rarity']
            const name = data[key]['name'].replace(/ /gi, '-');
            const fullName = serumJson[serumId].replace(' ','').toLowerCase() + '_' + traitJson[key].replace(' ','').toLowerCase() + '_' + name + '_' + rarity;
            attributes.push({
                'trait_type': traitType,
                'value': fullName
            })
            attributesDb.push({
                'trait_type': traitJson[key],
                'value': data[key]['name']
            })
        }
        const json = {attributes, attributesDb};
        return json;
    }

    calcTraitCounts (serumIds) {
        const traitCounts = []
        let count;
        switch (serumIds.length) {
            case 1:
                count = this.random([1,2]);
                traitCounts.push(count);
                break;
            case 2:
                count = this.random([1,2]);
                traitCounts.push(count);
                if(count == 1){
                    count = this.random([1,2]);
                    traitCounts.push(count);
                } else {
                    traitCounts.push(1);
                }
                break;
            case 3:
                for (let i = 0; i < 3; i ++){
                    traitCounts.push(1);
                }
                break;
        }
            
        return traitCounts;
    }

    getTriatForSerum(serumId) {
        const datas = this.traitAssets.filter(asset => asset['serum_id'] == serumId);
        let traits = datas.map(data =>data['trait_id']);
        traits = traits.filter(function (value, index, array) { 
            return array.indexOf(value) === index;
        });
        return traits;
    }

    getTraitAssetName(serumId, traitIds){
        let finished = false;
        const get = () => {
            const rarity = this.randomRarityByWeight();
            const datas = this.traitAssets.filter(asset => asset['serum_id'] == serumId && asset['rarity'] == rarity && traitIds.includes(asset['trait_id']))
            const asset = this.random(datas);
            if (asset) {
                return {name: asset['name'], traitId: asset['trait_id'], rarity: rarity};
            }
        }
        while (!finished) {
            const result = get();
            if(result) {
                finished = true;
                return result;
            }
        }
    }

    async getTraitAssetsBySerum(serumIds, traitCounts) {
        let traitIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];
        let result = {}
        for(let i = 0; i < serumIds.length; i ++) {
            for (let j = 0 ; j < traitCounts[i]; j ++) {
                const {name, traitId, rarity} = this.getTraitAssetName(serumIds[i], traitIds);
                if(name) {
                    traitIds = this.removeFromArray(traitId, traitIds);
                    result[traitId] = {
                        'name': name,
                        'serumId': serumIds[i].toString(),
                        'rarity': rarity
                    }
                    // console.log(name, serumIds[i].toString(), rarity)
                }
            }
        }

        while(traitIds.length > 0) {
            const {name, traitId, rarity} = this.getTraitAssetName('12', traitIds)
            traitIds = this.removeFromArray(traitId, traitIds);
            result[traitId] = {
                'name': name,
                'serumId': '12',
                'rarity': rarity
            }
        }
        const metadata = this.generateImageMetadata(result)
        return metadata;
    }
    // external

    addJob(tokenId, attributes) {
        switch(this.lastQueue + 1){
            case 1 :
                this.queueOne.addJob(tokenId, attributes, this.lastQueue + 1, process.env.AVATAR_SERVER_ONE_URL);
                break;
            case 2 :
                this.queueTwo.addJob(tokenId, attributes, this.lastQueue + 1, process.env.AVATAR_SERVER_TWO_URL);
                break;
        }
        this.lastQueue = (this.lastQueue + 1) % 2;
    }
    async createMetadata (wallet, serumIds) {
        const tokenId = this.generateTokenId();
        const traitCounts = this.calcTraitCounts(serumIds);

        const metadata = await this.getTraitAssetsBySerum(serumIds, traitCounts)
        this.saveMetadata(tokenId, metadata.attributesDb);
        this.addJob(tokenId, metadata.attributes)

        return tokenId;
    }
}


  
module.exports = {
    MixologyService
}
