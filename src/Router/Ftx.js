var express = require('express');
var router = express.Router();
var {get, save, set} = require('../Controller/FtxController');
var MiddlewareAuth = require('../Middleware/MiddlewareAuth')

router.get('/get/:wallet', async(request, response) => {
    get(request, response);
});

router.post('/save', MiddlewareAuth, async(request, response) => {
    save(request, response);
});

router.post('/set', async(request, response) => {
    set(request, response);
});

module.exports = router;