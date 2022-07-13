var express = require('express');
var router = express.Router();
var {create, addFailedIds, getFailedIds} = require('../Controller/3dGenerateController');
var MiddlewareAuth = require('../Middleware/MiddlewareAuth')

router.post('/create', MiddlewareAuth, async(request, response) => {
    create(request, response);
});

router.post('/add_failed_ids', async(request, response) => {
    addFailedIds(request, response);
});

router.get('/get_failed_ids', async(request, response) => {
    getFailedIds(request, response);
});

module.exports = router;