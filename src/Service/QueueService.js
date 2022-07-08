
const Queue = require('bull');
const log4js = require("log4js");
const axios = require('axios').default;

require("dotenv").config();

const {metadataModel} = require('../Model/MetadataBBHModel');
const {userModel} = require('../Model/UserModel');

const {getOwner} = require('./Web3Service');
const {sendEmail} = require('./EmailService');


class QueueService {
    constructor(serverNumber) {
        this.serverNumber = serverNumber;
        
        this.logger = log4js.getLogger();
        this.logger.level = "all";

        this.queue = new Queue(`3d rendering ${serverNumber}`, { redis: { port: process.env.REDIS_PORT, host: process.env.REDIS_URL, password: process.env.REDIS_PASS } });

        this.queue.process(this.processJob)

        this.queue.on('completed', (job) => {
            this.logger.info(`Queue ${serverNumber}'s job ${job.id} completed, token id ${job.data.tokenId}`);
            this.completeJob(job.data.tokenId);
        })
        this.queue.on('error', (error) => {
            this.logger.info(`Queue ${serverNumber}'s job has error ${error}`);
        })
        this.queue.on('failed', (job) => {
            this.logger.info(`Queue ${serverNumber}'s job ${job.id} failed, token id ${job.data.tokenId}`);
        })
    }

    async processJob (job, done) {
        let logger = log4js.getLogger();
        logger.level = "all";
        logger.info(`Queue ${job.data.serverNumber}'s job ${job.id} is runnig, token id ${job.data.tokenId}`);
        try {
            const result = await axios.get(`${job.data.serverUrl}/status`);
            if(!result.data.running){
                await axios.post(`${job.data.serverUrl}/create-avatar`, {
                    id: job.data.tokenId,
                    metadata: job.data.metadata
                });
                done();
            }
            else{
                logger.error(`Queue ${job.data.serverNumber} server is not free now.`);
                done(true);
            }
        } catch (e) {
            logger.error(e.response.status);
            done(true);
        }
    };

    addJob (tokenId, attributes, serverNumber, serverUrl) {
        this.queue.add({tokenId, metadata: {'attributes': attributes}, serverNumber, serverUrl}, {
            attempts: 3 
        });
        this.logger.info(`Job is added to queue ${this.serverNumber}, token id ${tokenId}`);
    }
    
    async completeJob (tokenId) {
        let metadata = await metadataModel.find({tokenId: tokenId});

        const s3Folder = process.env.NODE_ENV == 'production' ? '3d-avatar' : '3d-avatar-dev'
        const image = `https://luna-bucket.s3.us-east-2.amazonaws.com/${s3Folder}/${tokenId}.png`

        metadata[0].image = image;
        metadata[0].animation_url = "";
        await metadata[0].save();

        const wallet = await getOwner(tokenId.toString());

        if(wallet && wallet.length == 42) {
            const user = await userModel.find({ wallet: wallet.toLowerCase() });

            if(user.length > 0 && user[0].email != "") {
                sendEmail(user[0].email);
            }
        }
    }
}

module.exports = {
    QueueService
}