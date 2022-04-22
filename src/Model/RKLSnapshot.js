let mongoose = require('mongoose');

let snapshotSchema = new mongoose.Schema({
    address : {
        type : String,
        require : true,
    },
    quantity : {
        type: Number,
        require : true
    },
  },{
      timestamps : true,
  });

module.exports = {
    rklSnapshotModel : mongoose.model('rkl_snapshot', snapshotSchema)
}