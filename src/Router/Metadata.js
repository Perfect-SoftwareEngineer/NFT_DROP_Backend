var express = require('express');
var router = express.Router();

var RouterMetadataD1 = require('./MetadataD1');
var RouterMetadataD3 = require('./MetadataD3');
var RouterMetadataGala = require('./MetadataGala');
var RouterMetadataIntel = require('./MetadataIntel');
var RouterMetadataBB = require('./MetadataBB');
var RouterMetadataSerum = require('./MetadataSerum');

router.use('/drop1', RouterMetadataD1);
router.use('/drop3', RouterMetadataD3);
router.use('/gala', RouterMetadataGala);
router.use('/intel', RouterMetadataIntel);
router.use('/basketball', RouterMetadataBB);
router.use('/serum', RouterMetadataSerum);

module.exports = router;