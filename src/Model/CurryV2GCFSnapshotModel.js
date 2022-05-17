let mongoose = require('mongoose')

let curryV2GCFSnapshotSchema = new mongoose.Schema({
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
    curryV2GCFSnapshotModel : mongoose.model('curryv2_gcf_snapshot', curryV2GCFSnapshotSchema)
}