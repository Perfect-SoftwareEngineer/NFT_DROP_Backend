let mongoose = require('mongoose')

let intelSnapshotSchema = new mongoose.Schema({
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
    intelSnapshotModel : mongoose.model('intel_snapshot', intelSnapshotSchema)
}