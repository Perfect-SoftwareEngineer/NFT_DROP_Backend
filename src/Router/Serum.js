var express = require('express');
var router = express.Router();
var RouterMerkleSerum = require('./MerkleSerum');

router.use('/merkle', RouterMerkleSerum);

module.exports = router;