const sgMail = require('@sendgrid/mail');
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const contactEmail = 'contact@lunamarket.io';

const sendEmail = (email, tokenId, txHash)=> {
  let emailData = {
    to: email,
    from: contactEmail,
    templateId: process.env.SENDGRID_ORDER_CONFIRMATION_TRANSACTION_ID,
    subject: "Thank you for joining GetLost!",
    dynamic_template_data: {
      "token_id": tokenId,
      "transaction_hash": "https://mumbai.polygonscan.com/tx/" + txHash
    }
  }
  sgMail.send(emailData);
}

module.exports = {
  sendEmail
}