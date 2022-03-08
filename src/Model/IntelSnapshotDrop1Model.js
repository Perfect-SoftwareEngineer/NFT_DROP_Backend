let mongoose = require('mongoose')

let intelSnapshotDrop1Schema = new mongoose.Schema({
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
    }
  },{
      timestamps : true,
  });

module.exports = {
    intelSnapshotDrop1Model : mongoose.model('intel_snapshot_drop1', intelSnapshotDrop1Schema)
}