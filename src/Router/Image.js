var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk')
var MiddlewareAuth = require('../Middleware/MiddlewareAuth')
require("dotenv").config();

const bucket = 'luna-bucket'
AWS.config.update({
    accessKeyId: process.env.awsAccessKeyId,
    secretAccessKey: process.env.awsSecretAccessKey
})

const s3 = new AWS.S3()

router.post('/upload', MiddlewareAuth,  async (request, response) => {
    const image = request.files.file.data;
    console.log(image)
    try{
        s3.upload({
            Bucket: bucket,
            Key: `8-ball.jpeg`,
            Body: image,
            ACL: 'public-read',
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg'
        }, function(err, data) {
            console.log(err, data);
        })
        return response.status(200).send("ok");
    } catch(err){
        return response.status(500).send(err);
    }
})

module.exports = router;