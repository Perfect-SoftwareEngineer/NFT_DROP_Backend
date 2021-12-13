let mongoose = require('mongoose')

let paymentInfoSchema = new mongoose.Schema({
    email : {
        type : String,
        require : true,
    },
    wallet : {
        type : String,
        require : true,
    },
    tokenId : {
        type : String,
        require : true,
    },
    status : {
        type : String,
        require : true,
    },
    ip : {
        type : String,
        require : true,
    },
    country_name : {
        type : String,
        require : true,
    },
    date : {
        type : Date,
        require : true,
    },
  },{
      timestamps : true,
  });

module.exports = {
    paymentInfoModel : mongoose.model('PaymentInfo', paymentInfoSchema)
}