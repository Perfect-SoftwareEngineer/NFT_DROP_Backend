var express = require('express');
var router = express.Router();
var {getBbHexProof, getBbGCFRoot, getBbCommunityRoot, getBbGCFHexProof, getBbCommunityHexProof, bbGcfClaim, bbCommunityClaim} = require('../Controller/MerkleCurryV2Controller');
var MiddlewareAuth = require('../Middleware/MiddlewareAuth')

router.get('/hex_proof/:gameId/:wallet', async(request, response) => {
    getBbHexProof(request, response);
});

router.get('/gcf/hex_proof/:wallet', async(request, response) => {
    getBbGCFHexProof(request, response);
});

router.get('/gcf/root', async(request, response) => {
    getBbGCFRoot(request, response);
});

router.post('/gcf/claim', MiddlewareAuth, async(request, response) => {
    bbGcfClaim(request, response);
});

router.get('/community/hex_proof/:wallet', async(request, response) => {
    getBbCommunityHexProof(request, response);
});

router.get('/community/root', async(request, response) => {
    getBbCommunityRoot(request, response);
});

router.post('/community/claim', MiddlewareAuth, async(request, response) => {
    bbCommunityClaim(request, response);
});

module.exports = router;