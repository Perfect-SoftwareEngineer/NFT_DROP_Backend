var {holderD1Model} = require('../Model/HolderD1Model')
const sgMail = require('@sendgrid/mail');
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const contactEmail = 'contact@lunamarket.io';

const sendEmail = (email, position, referral_code, cb)=> {
  let emailData = {
    to: email,
    from: contactEmail,
    templateId: process.env.SENDGRID_TRANSACTION_ID,
    subject: "Thank you for joining GetLost!",
    dynamic_template_data: {
      "position": position,
      "reference_code": referral_code
    }
  }
  sgMail.send(emailData, cb);
}

module.exports = {
  getNft
}