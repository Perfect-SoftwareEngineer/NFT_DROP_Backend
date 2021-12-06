var express = require('express');
var router = express.Router();
var {get, getAll, create, update} = require('../Controller/PaymentInfoController');
var MiddlewareAuth = require('../Middleware/MiddlewareAuth')


router.get('/getAll', MiddlewareAuth, async(request, response) => {
    getAll(request, response);
});
router.get('/get/:_id', MiddlewareAuth, async(request, response) => {
    get(request, response);
});
router.post('/create', async(request, response) => {
    create(request, response);
});
router.post('/update', MiddlewareAuth, async(request, response) => {
    update(request, response);
});
module.exports = router;