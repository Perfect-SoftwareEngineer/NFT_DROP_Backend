let mongoose = require('mongoose')

let userSchema = new mongoose.Schema({
    wallet : {
        type : String,
        unique : true,
        require : true,
    },
    signature : {
        type : String,
        require : true,
        require : true,
    },
    role : {
        type: String,
        require : true
    }
  },{
      timestamps : true,
  });

module.exports = {
    userModel : mongoose.model('user', userSchema)
}