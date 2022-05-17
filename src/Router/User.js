var express = require('express');
var router = express.Router();
var {create, get} = require('../Controller/UserController');

router.post('/create', (request, response) => {
    create(request, response)
})

router.get('/get/:wallet', (request, response) => {
    get(request, response)
})

module.exports = router;