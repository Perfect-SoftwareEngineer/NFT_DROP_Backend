let mongoose = require('mongoose')

let intelWhitelistSchema = new mongoose.Schema({
    wallet : {
        type : String,
        unique : true,
        require : true,
    },
    user : {
        type : String,
        unique : true,
        require : true
    }
  },{
      timestamps : true,
  });

module.exports = {
    intelWhitelistModel : mongoose.model('intel_whitelist', intelWhitelistSchema)
}