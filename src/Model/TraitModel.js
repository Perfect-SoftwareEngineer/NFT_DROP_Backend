let mongoose = require('mongoose')

let traitSchema = new mongoose.Schema({
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
    traitModel : mongoose.model('trait', traitSchema)
}