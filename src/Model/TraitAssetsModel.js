let mongoose = require('mongoose')

let traitAssetsSchema = new mongoose.Schema({
    serum_id : {
        type : String,
        require : true,
    },
    trait_id : {
        type : String,
        require : true,
    },
    name : {
        type : String,
        require : true
    },
    rarity: {
        type: String,
        enum : ['common', 'rare', 'epic', 'legendary'],
        default: 'common'
    },
  },{
      timestamps : true,
  });

module.exports = {
    traitAssetsModel : mongoose.model('trait_assets', traitAssetsSchema)
}