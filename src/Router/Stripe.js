
const express = require("express");
const router = express.Router();
const stripe = require('../constants/stripe');
var jwt = require('jsonwebtoken');


require("dotenv").config();

const postStripeCharge = res => (stripeErr, stripeRes) => {
  if (stripeErr) {
    res.status(500).send({ error: stripeErr });
  } else {
    const email = stripeRes.billing_details.name;
    const id = stripeRes.id;
    const token = jwt.sign(
      { email: email },
      process.env.jwtSecret,
      { expiresIn: process.env.jwtExpiration }
    );
    res.status(200).send({ token: token, id });
  }
}
  
router.get('/', (req, res) => {
  res.send({ message: 'Hello Stripe checkout server!', timestamp: new Date().toISOString() })
});

router.post('/', (req, res) => {
  stripe.charges.create(req.body, postStripeCharge(res));
});

router.post('/refund/:id', async (req, res) => {
    const { id } = req.params;
    const refund = await stripe.refunds.create({
      charge: id,
    });
    
    res.status(200).json({ success: true, refund });
})

module.exports = router;
