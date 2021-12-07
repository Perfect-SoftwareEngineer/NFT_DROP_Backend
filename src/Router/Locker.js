var express = require('express');
var router = express.Router();
var { getNft } = require('../Controller/LockerController');

router.get('/get/:wallet', (request, response) => {
    getNft(request, response)
})

module.exports = router;