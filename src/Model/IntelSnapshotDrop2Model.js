let mongoose = require('mongoose')

let intelSnapshotDrop2Schema = new mongoose.Schema({
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
    intelSnapshotDrop2Model : mongoose.model('intel_snapshot_drop2', intelSnapshotDrop2Schema)
}