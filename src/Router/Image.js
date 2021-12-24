var express = require('express');
var router = express.Router();
var {upload} = require('../Controller/S3Controller')
require("dotenv").config();


router.post('/upload',  async (request, response) => {
    const image = request.files.file.data;
    const name = request.files.file.name;
    const type = request.files.file.mimetype;
    console.log({type, name})
    upload(image, name, type, response);
})

module.exports = router;