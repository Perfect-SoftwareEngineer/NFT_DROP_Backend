var express = require('express');
var router = express.Router();
var {create} = require('../Controller/3dGenerateController');
var MiddlewareAuth = require('../Middleware/MiddlewareAuth')

router.post('/create', MiddlewareAuth, async(request, response) => {
    create(request, response);
});

module.exports = router;