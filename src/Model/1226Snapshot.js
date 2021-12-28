let mongoose = require('mongoose');

let snapshotSchema = new mongoose.Schema({
    address : {
        type : String,
        require : true,
    },
    tokenId: {
        type: Number,
        require : true
    },
    quantity : {
        type: Number,
        require : true
    },
    claimed: {
        type: Boolean,
    }
  },{
      timestamps : true,
  });

module.exports = {
    snapshotModel : mongoose.model('1226_snapshot', snapshotSchema)
}