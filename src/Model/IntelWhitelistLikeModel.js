let mongoose = require('mongoose')

let intelWhitelistLikeSchema = new mongoose.Schema({
    id : {
        type : String,
        unique : true,
        require : true,
    },
    name : {
        type : String,
        require : true
    },
    username : {
        type : String,
        unique: true,
        require : true
    }
  },{
      timestamps : true,
      size : 50000
  });

module.exports = {
    intelWhitelistLikeModel : mongoose.model('intel_whitelist_like', intelWhitelistLikeSchema)
}