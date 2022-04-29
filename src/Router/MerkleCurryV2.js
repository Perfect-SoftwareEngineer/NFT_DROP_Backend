var express = require('express');
var router = express.Router();
var {getBBHexProof, getGCFRoot, getGCFHexProof} = require('../Controller/MerkleCurryV2Controller');


router.get('/hex_proof/:gameId/:wallet', async(request, response) => {
    getBBHexProof(request, response);
});

router.get('/gcf/hex_proof/:wallet', async(request, response) => {
    getGCFHexProof(request, response);
});

router.get('/gcf/root', async(request, response) => {
    getGCFRoot(request, response);
});
module.exports = router;