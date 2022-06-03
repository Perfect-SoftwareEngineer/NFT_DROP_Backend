let mongoose = require('mongoose')

let serumGCFSnapshotSchema = new mongoose.Schema({
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
    serumGCFSnapshotModel : mongoose.model('serum_gcf_snapshot', serumGCFSnapshotSchema)
}