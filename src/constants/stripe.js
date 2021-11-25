const configureStripe = require('stripe');

const STRIPE_SECRET_KEY = process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY
    : 'sk_test_51Jws6oBRj8NvWNRSz9waTCp6Yxm6W6SS4cTop335oACT85B7vm9udGYqbz9knmCyEamDuGOqZZUEqzJKt9xfxmKd00Tw1dCPhh';

const stripe = configureStripe(STRIPE_SECRET_KEY);

module.exports = stripe;