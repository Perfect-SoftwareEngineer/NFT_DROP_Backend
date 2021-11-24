const { TwitterApi } = require('twitter-api-v2');

// Instantiate Twitter API
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

async function createTweet(status) {
    try {
        const createdTweet = await client.v1.tweet(status, {
            status
        });
        console.log('Tweet', createdTweet.id_str, ':', createdTweet.full_text);
    } catch(e) {
        if (e.code != 403) {
            console.error(e);
        } else {
            console.log('duplicate tweet. Not tweeting...');
        }
    }
}

module.exports = {
    client,
    createTweet
}