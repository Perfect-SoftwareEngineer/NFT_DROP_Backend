var express = require('express');
var router = express.Router();
var {get, getAll, create, update} = require('../Controller/MetadataD3Controller');



router.get('/getAll', async(request, response) => {
    getAll(request, response);
});
router.get('/get/:tokenId', async(request, response) => {
    get(request, response);
});
router.post('/create', async(request, response) => {
    create(request, response);
});
router.post('/update', async(request, response) => {
    update(request, response);
});
module.exports = router;