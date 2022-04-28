let mongoose = require('mongoose')

let curryV2GCFSnapshotSchema = new mongoose.Schema({
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
    curryV2GCFSnapshotModel : mongoose.model('curryv2_gcf_snapshot', curryV2GCFSnapshotSchema)
}