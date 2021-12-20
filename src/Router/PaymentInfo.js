var express = require('express');
var router = express.Router();
var {getTokenId, get, getAll, getCount, create, update} = require('../Controller/PaymentInfoController');
var MiddlewareAuth = require('../Middleware/MiddlewareAuth')


router.post('/approve', async(request, response) => {
    getTokenId(request, response);
});

router.get('/getCount', async(request, response) => {
    getCount(request, response);
});
router.get('/getAll', async(request, response) => {
    getAll(request, response);
});
router.get('/get/:_id', async(request, response) => {
    get(request, response);
});
router.post('/create', MiddlewareAuth, async(request, response) => {
    create(request, response);
});
router.post('/update', async(request, response) => {
    update(request, response);
});
module.exports = router;