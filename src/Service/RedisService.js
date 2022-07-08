
const axios = require('axios').default;
require("dotenv").config();

async function processJob (job, done) {
    console.log("queue ", job.id, job.data.tokenId);
    try {

        const result = await axios.get(`${process.env.AVATAR_SERVER_URL}:3000/status`);
        if(!result.running){
            axios.post(`${process.env.AVATAR_SERVER_URL}:3000/create-avatar`, {
                id: job.data.tokenId,
                metadata: job.data.metadata
            }).then(res => done())
            .catch(e => {
                console.log(e.response.status)
                done(true)        
            });
        }
        else{
            console.log("no free server")
        }
    } catch (e) {
        console.log(e.response.status)
        done(true)
    }
        

};

module.exports = {processJob}