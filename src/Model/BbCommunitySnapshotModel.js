let mongoose = require('mongoose')

let bbCommunitySnapshotSchema = new mongoose.Schema({
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
    bbCommunitySnapshotModel : mongoose.model('basketball_community_snapshot', bbCommunitySnapshotSchema)
}