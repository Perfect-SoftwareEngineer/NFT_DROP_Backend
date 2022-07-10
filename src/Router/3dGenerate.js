var express = require('express');
var router = express.Router();
var {create, addFailedIds} = require('../Controller/3dGenerateController');
var MiddlewareAuth = require('../Middleware/MiddlewareAuth')

router.post('/create', MiddlewareAuth, async(request, response) => {
    create(request, response);
});

router.post('/add_failed_ids', async(request, response) => {
    addFailedIds(request, response);
});

module.exports = router;