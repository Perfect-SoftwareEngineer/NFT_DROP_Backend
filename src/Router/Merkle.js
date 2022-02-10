var express = require('express');
var router = express.Router();
var {getRoot, getHexProof} = require('../Controller/MerkleController');


router.get('/root', (request, response) => {
    getRoot(request, response)
})

router.get('/hex_proof/:wallet', async(request, response) => {
    getHexProof(request, response);
});

module.exports = router;