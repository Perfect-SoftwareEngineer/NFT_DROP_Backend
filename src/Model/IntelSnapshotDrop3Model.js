let mongoose = require('mongoose')

let intelSnapshotDrop3Schema = new mongoose.Schema({
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
    intelSnapshotDrop3Model : mongoose.model('intel_snapshot_drop3', intelSnapshotDrop3Schema)
}