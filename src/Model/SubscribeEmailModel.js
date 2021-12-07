let mongoose = require('mongoose')

let subscribeEmailSchema = new mongoose.Schema({
    email : {
        type : String,
        unique : true,
        require : true,
    }
  },{
      timestamps : true,
  });

module.exports = {
    subscribeEmailModel : mongoose.model('subscribe_email', subscribeEmailSchema)
}