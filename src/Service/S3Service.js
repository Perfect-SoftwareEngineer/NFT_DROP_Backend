var AWS = require('aws-sdk')
require("dotenv").config();

const bucket = 'luna-bucket'
AWS.config.update({
    accessKeyId: process.env.awsAccessKeyId,
    secretAccessKey: process.env.awsSecretAccessKey
})

const s3 = new AWS.S3()


const upload = (content, folder, name, type, response) => {
    try{
        console.log(`${folder}/${name}`)
        s3.upload({
            Bucket: bucket,
            Key: `${folder}/${name}`,
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

const uploadImage = (content, name, type) => {
    
    s3.upload({
        Bucket: bucket,
        Key: name,
        Body: content,
        ACL: 'public-read',
        ContentEncoding: 'base64',
        ContentType: type
    }, function(err, data) {
        if(err) 
            console.log(err)
    })
}

module.exports = {
    upload,
    uploadImage
}