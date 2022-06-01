let mongoose = require('mongoose')

let serumCommunitySnapshotSchema = new mongoose.Schema({
    address : {
        type : String,
        unique : true,
        require : true,
    },
    token_id : {
        type : String,
        require : true
    },
    quantity : {
        type : String,
        require : true
    },
    claimed : {
        type: Boolean,
        require : true,
        default: false  
    }
  },{
      timestamps : true,
  });

module.exports = {
    serumCommunitySnapshotModel : mongoose.model('serum_community_snapshot', serumCommunitySnapshotSchema)
}