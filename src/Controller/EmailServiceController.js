const sgMail = require('@sendgrid/mail');
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const contactEmail = 'contact@lunamarket.io';
const polygonscan = process.env.NODE_ENV == 'production' ? "https://polygonscan.com/tx/" : "https://mumbai.polygonscan.com/tx/";
const sendEmail = (email, txHash)=> {
  let emailData = {
    to: email,
    from: contactEmail,
    templateId: process.env.SENDGRID_TRANSACTION_ID,
    dynamic_template_data: {
      "transaction_hash": polygonscan + txHash
    }
  }
  sgMail.send(emailData);
}

module.exports = {
  sendEmail
}