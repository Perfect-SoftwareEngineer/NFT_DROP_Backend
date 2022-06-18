var express = require('express');
var router = express.Router();
var Router3dGenerate = require('./3dGenerate');

router.use('/3d_generate', Router3dGenerate);

module.exports = router;