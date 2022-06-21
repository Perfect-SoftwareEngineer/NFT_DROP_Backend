
const Chance = require('chance');
const path = require('path');
const fs = require('fs');
const {traitAssetsModel} = require('../Model/TraitAssetsModel');
const traitJson = require('../constants/Trait.json');
const serumJson = require('../constants/Serum.json');

class MixologyService {
    constructor(){
        this.chance = new Chance();
        traitAssetsModel.find({})
        .then(result => this.traitAssets = result)
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

    generateMetadata(data){
        const attributes = []
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
        }
        const json = {"attributes" : attributes};
        fs.writeFileSync("metadata.json", JSON.stringify(json));
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
        const rarity = this.randomRarityByWeight()
            
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

    getTraitAssetName(serumId, traitId, rarity){
        console.log(serumId, traitId, rarity)
        const datas = this.traitAssets.filter(asset => asset['serum_id'] == serumId && asset['trait_id'] == traitId && asset['rarity'] == rarity)
        const asset = this.random(datas);
        if (asset) 
            return asset.name;
        else 
            return;
    }

    async getTraitAssetsBySerum(serumIds, traitCounts) {
        let traitIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
        let result = {}
        for(let i = 0; i < serumIds.length; i ++) {
            let serumTraitIds = this.getTriatForSerum(serumIds[i])
            for (let j = 0 ; j < traitCounts[i]; j ++) {
                const rarity = this.randomRarityByWeight();
                const traitId = this.random(serumTraitIds);
                serumTraitIds = this.removeFromArray(traitId, serumTraitIds);
                const name = this.getTraitAssetName(serumIds[i], traitId, rarity)
                if(name) {
                    traitIds = this.removeFromArray(traitId, traitIds);
                    result[traitId] = {
                        'name': name,
                        'serumId': serumIds[i].toString(),
                        'rarity': rarity
                    }
                }
            }
        }

        for(let i = 0; i < traitIds.length; i ++) {
            const rarity = this.randomRarityByWeight();
            const name = this.getTraitAssetName('12', traitIds[i], rarity)
            result[traitIds[i]] = {
                'name': name,
                'serumId': '12',
                'rarity': rarity
            }
        }
        this.generateMetadata(result)
    }
    // external
    async createMetadata (request) {
        const {wallet, serumIds} = request.body;
        const traitCounts = this.calcTraitCounts(serumIds);
        console.log(traitCounts)
        this.getTraitAssetsBySerum(serumIds, traitCounts)
    }
}


  
module.exports = {
    MixologyService
}
