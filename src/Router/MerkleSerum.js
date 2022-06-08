var express = require('express');
var router = express.Router();
var {getSerumGCFHexProof, getSerumGCFRoot, getSerumCommunityHexProof, getSerumCommunityRoot} = require('../Controller/MerkleCurryV2Controller');

router.get('/gcf/hex_proof/:wallet', async(request, response) => {
    getSerumGCFHexProof(request, response);
});

router.get('/gcf/root', async(request, response) => {
    getSerumGCFRoot(request, response);
});

// router.post('/gcf/claim', MiddlewareAuth, async(request, response) => {
//     gcfClaim(request, response);
// });

router.get('/community/hex_proof/:wallet', async(request, response) => {
    getSerumCommunityHexProof(request, response);
});

router.get('/community/root', async(request, response) => {
    getSerumCommunityRoot(request, response);
});

// router.post('/community/claim', MiddlewareAuth, async(request, response) => {
//     communityClaim(request, response);
// });

module.exports = router;