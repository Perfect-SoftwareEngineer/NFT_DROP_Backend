
const axios = require('axios').default;
require("dotenv").config();

async function processJob (job, done) {
    console.log("queue ", job.id, job.data.tokenId);
    try {
        const endpoint = `${process.env.AVATAR_SERVER_URL}:3000/create-avatar`
        const res = await axios.post(endpoint, {
            id: job.data.tokenId,
            metadata: job.data.metadata
        });
        done()
    } catch (e) {
        console.log(e.response.status)
        done(true)
    }
        

};

module.exports = {processJob}