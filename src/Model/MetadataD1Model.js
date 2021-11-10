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
        unique: true,
        require : true
    },
    externalUrl : {
        type: String,
    },
    tokenId : {
        type: String,
        require : true
    }
  },{
      timestamps : true,
  }
);

module.exports = {
    metadataModel : mongoose.model('metadata_drop1', metadataSchema)
}