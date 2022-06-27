
const axios = require('axios').default;


async function processJob (job) {
    console.log('here')
    const res = await axios.get('https://api.publicapis.org/entries');
    console.log("queue", job.id, res.data.count);
};

module.exports = {processJob}