let mongoose = require('mongoose')

let ftxCodeSchema = new mongoose.Schema({
    address : {
        type : String,
        // unique : true,
        require : true,
        default : "0x"
    },
    code : {
        type : String,
        unique : true,
        require : true,
    }
  },{
      timestamps : true,
  });

module.exports = {
    ftxCodeModel : mongoose.model('ftx_code', ftxCodeSchema)
}