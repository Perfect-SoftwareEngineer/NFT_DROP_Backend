let mongoose = require('mongoose')

let intelWhitelistRetweetSchema = new mongoose.Schema({
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
    intelWhitelistRetweetModel : mongoose.model('intel_whitelist_retweet', intelWhitelistRetweetSchema)
}