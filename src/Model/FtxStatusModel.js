let mongoose = require('mongoose')

let ftxStatusSchema = new mongoose.Schema({
    status : {
        type : Boolean,
        unique : true,
        require : true,
    }
  },{
      timestamps : true,
  });

module.exports = {
    ftxStatusModel : mongoose.model('ftx_status', ftxStatusSchema)
}