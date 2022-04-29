var AWS = require('aws-sdk')
require("dotenv").config();

const bucket = 'luna-bucket'
AWS.config.update({
    accessKeyId: process.env.awsAccessKeyId,
    secretAccessKey: process.env.awsSecretAccessKey
})

const s3 = new AWS.S3()


const upload = (content, name, type, response) => {
    try{
        s3.upload({
            Bucket: bucket,
            Key: name,
            Body: content,
            ACL: 'public-read',
            ContentEncoding: 'base64',
            ContentType: type
        }, function(err, data) {
            if(err) 
                return response.status(500).send("upload error");
            return response.status(200).send(data.Location);
        })
    } catch(err){
        return response.status(500).send(err);
    }
}

module.exports = {
    upload
}