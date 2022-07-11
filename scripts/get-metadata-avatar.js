const csvjson = require('csvjson');
const fs = require('fs');
const path = require('path');
const { connect } = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './../.env'});
const { traitAssetsModel } = require('../src/Model/TraitAssetsModel');
const { metadataModel } = require('../src/Model/MetadataBBHModel');

const connectDB = async () => {
  try {
    console.log(`Database connecting to ${process.env.NODE_ENV} environment.`);
    const production = process.env.NODE_ENV === 'production';
    const options = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    };
    
    await connect(
      process.env.MONGODB_PROD_URI,
      options,
    );
    console.log('MongoDB connected!');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

const failedIds = [
    56484626659876960000
]
const traits = {
    "Eyes": "1",
    "Background": "2",
    "Face Accessories": "3",
    "Ear Accessories": "4",
    "Neck Accessories": "5",
    "Mouth": "6",
    "Socks": "7",
    "Head Accessories": "8",
    "Torso": "9",
    "Pants": "10",
    "Shoes": "11",
    "Hand Accessories": "12",
    "Platform": "13"
}
const serums = {
    "1" : "Unanimous",
    "2" : "Broken History",
    "3" : "Flow",
    "4" : "Warp",
    "5" : "The Lab",
    "6" : "Smilesss",
    "7" : "Chibi Dinos",
    "8" : "Hape",
    "9" : "CyberKongz",
    "10" : "Under Armour",
    "11" : "Curry Brand",
    "12" : "Default"
}



const getSnapshots = async ()=> {
    const traitAssets = await traitAssetsModel.find();
    
    for(let i = 0 ; i < failedIds.length; i ++) {
        let attributes = [];
        let metadata = await metadataModel.find({tokenId: failedIds[i]});
        if(metadata.length > 0){
            metadata[0]['attributes'].map(data => {
                const asset = traitAssets.filter(asset => asset['trait_id'] == traits[data['trait_type']] && asset['name'].toLowerCase() == data['value'].toLowerCase())
                if(asset.length > 0) {
                    const traitType = data['trait_type'].replace(/ /gi, '_');
                    const serum = serums[asset[0]['serum_id']]
                    const rarity =  asset[0]['rarity']
                    const name = asset[0]['name'].replace(/ /gi, '-');
                    const fullName = serum.replace(' ','').toLowerCase() + '_' +  data['trait_type'].replace(' ','').toLowerCase() + '_' + name + '_' + rarity;
                    attributes.push({
                        'trait_type': traitType,
                        'value': fullName
                    })
                }
            })
        }
        const json = {"attributes" : attributes};
        fs.writeFileSync(`output/${failedIds[i]}.json`, JSON.stringify(json));
    }
    
}

const main = async ()=> {
    try {
        await connectDB();
        await getSnapshots();
        console.log("finished!");
    } catch(e) {
        console.error(e);
    }
}

main();
