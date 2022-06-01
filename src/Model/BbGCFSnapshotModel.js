let mongoose = require('mongoose')

let bbGCFSnapshotSchema = new mongoose.Schema({
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
    bbGCFSnapshotModel : mongoose.model('basketball_gcf_snapshot', bbGCFSnapshotSchema)
}