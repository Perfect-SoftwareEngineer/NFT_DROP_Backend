let mongoose = require('mongoose')

let userSchema = new mongoose.Schema({
    wallet : {
        type : String,
        unique : true,
        require : true,
    },
    signature : {
        type : String,
    },
    nonce : {
        type : Number,
        require : true,
        default : Math.floor(Math.random() * 1000000)
    },
    email : {
        type : String,
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