var express = require('express');
var router = express.Router();
var {getAll, create} = require('../Controller/SubscribeEmailController');
// var MiddlewareAuth = require('../Middleware/MiddlewareAuth')


router.get('/getAll', async(request, response) => {
    getAll(request, response);
});
router.post('/save',  async(request, response) => {
    create(request, response);
});
module.exports = router;