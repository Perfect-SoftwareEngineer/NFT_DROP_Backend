var express = require('express');
var router = express.Router();
var RouterFreeBB = require('./FreeBB');
var RouterMerkleBB = require('./MerkleBB');
var RouterFtx = require('./Ftx');

router.use('/free', RouterFreeBB);
router.use('/merkle', RouterMerkleBB);
router.use('/ftx', RouterFtx);

module.exports = router;