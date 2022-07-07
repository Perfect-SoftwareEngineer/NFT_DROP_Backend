const sgMail = require('@sendgrid/mail');
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const contactEmail = 'contact@lunamarket.io';
const sendEmail = (email)=> {
  let emailData = {
    to: email,
    from: contactEmail,
    templateId: process.env.SENDGRID_TRANSACTION_ID,
    dynamic_template_data: {
      "succeed": "You avatar successfully generated."
    }
  }
  sgMail.send(emailData);
}

module.exports = {
  sendEmail
}