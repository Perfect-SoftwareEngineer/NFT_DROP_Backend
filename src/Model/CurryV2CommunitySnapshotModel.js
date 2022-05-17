let mongoose = require('mongoose')

let curryV2CommunitySnapshotSchema = new mongoose.Schema({
    address : {
        type : String,
        unique : true,
        require : true,
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
    curryV2CommunitySnapshotModel : mongoose.model('curryv2_community_snapshot', curryV2CommunitySnapshotSchema)
}