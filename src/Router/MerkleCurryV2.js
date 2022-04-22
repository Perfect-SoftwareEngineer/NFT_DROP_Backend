var express = require('express');
var router = express.Router();
var {getBBHexProof} = require('../Controller/MerkleCurryV2Controller');


router.get('/hex_proof/:gameId/:wallet', async(request, response) => {
    getBBHexProof(request, response);
});

module.exports = router;