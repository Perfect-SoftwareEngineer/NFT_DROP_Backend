var express = require('express');
var router = express.Router();
var {get, getAll, create, update} = require('../Controller/MetadataD3Controller');
var MiddlewareAuth = require('../Middleware/MiddlewareAuth')


router.get('/getAll', MiddlewareAuth, async(request, response) => {
    getAll(request, response);
});
router.get('/get/:tokenId', MiddlewareAuth, async(request, response) => {
    get(request, response);
});
router.post('/create', MiddlewareAuth, async(request, response) => {
    create(request, response);
});
router.post('/update', MiddlewareAuth, async(request, response) => {
    update(request, response);
});
module.exports = router;