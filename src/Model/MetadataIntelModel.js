let mongoose = require('mongoose')

let metadataSchema = new mongoose.Schema({
    name : {
        type : String,
        require : true,
        minlength : 4
    },
    description : {
        type : String,
        require : true,
    },
    image : {
        type : String,
        require : true
    },
    external_url : {
        type: String,
    },
    animation_url : {
        type: String,
    },
    tokenId : {
        type: String,
        require : true
    },
    fee_recipient : {
        type: String,
        require : true
    }
  },{
      timestamps : true,
  }
);

module.exports = {
    metadataModel : mongoose.model('metadata_intel', metadataSchema)
}