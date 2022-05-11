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
    }
  },{
      timestamps : true,
  });

module.exports = {
    curryV2CommunitySnapshotModel : mongoose.model('curryv2_community_snapshot', curryV2CommunitySnapshotSchema)
}