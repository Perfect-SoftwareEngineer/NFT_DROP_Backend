var express = require('express');
var router = express.Router();
var {get, getWinner, getAll, reserve, getUnclaimed, claim} = require('../Controller/FreeBBController');
var MiddlewareAuth = require('../Middleware/MiddlewareAuth')


router.get('/getAll', async(request, response) => {
    getAll(request, response);
});

router.get('/get/:gameId/:wallet', async(request, response) => {
    get(request, response);
});

router.get('/get_winner/:gameId', async(request, response) => {
    getWinner(request, response);
});

router.get('/get_unclaimed/:wallet',  async(request, response) => {
    getUnclaimed(request, response);
});

router.post('/reserve',  async(request, response) => {
    reserve(request, response);
});

router.post('/claim',  async(request, response) => {
    claim(request, response);
});


module.exports = router;