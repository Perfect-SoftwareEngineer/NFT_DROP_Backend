let mongoose = require('mongoose')

let serumSchema = new mongoose.Schema({
    id : {
        type : String,
        unique : true,
        require : true,
    },
    name : {
        type : String,
        require : true
    }
  },{
      timestamps : true,
  });

module.exports = {
    serumModel : mongoose.model('serum', serumSchema)
}