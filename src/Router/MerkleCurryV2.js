var express = require('express');
var router = express.Router();
var {getBBHexProof, getGCFRoot, getCommunityRoot, getGCFHexProof, getCommunityHexProof, gcfClaim, communityClaim} = require('../Controller/MerkleCurryV2Controller');
var MiddlewareAuth = require('../Middleware/MiddlewareAuth')

router.get('/hex_proof/:gameId/:wallet', async(request, response) => {
    getBBHexProof(request, response);
});

router.get('/gcf/hex_proof/:wallet', async(request, response) => {
    getGCFHexProof(request, response);
});

router.get('/gcf/root', async(request, response) => {
    getGCFRoot(request, response);
});

router.post('/gcf/claim', MiddlewareAuth, async(request, response) => {
    gcfClaim(request, response);
});

router.get('/community/hex_proof/:wallet', async(request, response) => {
    getCommunityHexProof(request, response);
});

router.get('/community/root', async(request, response) => {
    getCommunityRoot(request, response);
});

router.post('/community/claim', MiddlewareAuth, async(request, response) => {
    communityClaim(request, response);
});

module.exports = router;