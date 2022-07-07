var express = require('express');
var router = express.Router();
var {create, get, registerEmail} = require('../Controller/UserController');
var MiddlewareAuth = require('../Middleware/MiddlewareAuth')

router.post('/create', (request, response) => {
    create(request, response)
})

router.get('/get/:wallet', (request, response) => {
    get(request, response)
})

router.post('/register_email', MiddlewareAuth, (request, response) => {
    registerEmail(request, response)
})

module.exports = router;