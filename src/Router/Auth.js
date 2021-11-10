var express = require('express');
var router = express.Router();
var {signin} = require('../Controller/UserController');

router.post('/signin', (request, response) => {
    signin(request, response)
})

router.post('/signup', (request, response) => {
    signup(request, response)
})

module.exports = router;