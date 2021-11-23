let mongoose = require('mongoose')

let holderSchema = new mongoose.Schema({
    wallet : {
        type : String,
        unique : true,
        require : true,
    },
    tokenId : {
        type: String,
        require : true
    },
    quantity : {
        type: Number,
        require: true
    }
  },{
      timestamps : true,
  });

module.exports = {
    holderD1Model : mongoose.model('holder_drop1', holderSchema)
}