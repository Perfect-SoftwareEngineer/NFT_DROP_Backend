
const Queue = require('bull');
const log4js = require("log4js");
const axios = require('axios').default;

require("dotenv").config();



class QueueService {
    constructor(serverNumber) {
        this.serverNumber = serverNumber;
        
        this.logger = log4js.getLogger();
        this.logger.level = "all";

        this.queue = new Queue(`3d rendering ${serverNumber}`, { redis: { port: process.env.REDIS_PORT, host: process.env.REDIS_URL, password: process.env.REDIS_PASS } });

        this.queue.process(this.processJob)

        this.queue.on('completed', (job) => {
            this.logger.info(`Queue ${serverNumber}'s job ${job.id} completed, token id ${job.data.tokenId}`);
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
            const result = await axios.get(`${job.data.serverUrl}:3000/status`);
            if(!result.data.running){
                await axios.post(`${job.data.serverUrl}:3000/create-avatar`, {
                    id: job.data.tokenId,
                    metadata: job.data.metadata
                });
                done();
            }
            else{
                logger.error(`Queue ${this.serverNumber} server is not free now.`);
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
    
}

module.exports = {
    QueueService
}