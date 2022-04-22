var express = require('express');
var router = express.Router();
var {get} = require('../Controller/CurrentWarriorsMatchController');


router.get('/get', async(request, response) => {
    get(request, response);
});

module.exports = router;