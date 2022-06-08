var express = require('express');
var router = express.Router();
var RouterBasketball = require('./Basketball');
var RouterSerum = require('./Serum');
var RouterCurrentMatch = require('./CurrentMatch')

router.use('/basketball', RouterBasketball);
router.use('/serum', RouterSerum);
router.use('/current/match', RouterCurrentMatch);

module.exports = router;