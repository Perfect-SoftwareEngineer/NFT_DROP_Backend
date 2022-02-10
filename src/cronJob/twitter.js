const { TwitterApi } = require('twitter-api-v2');
var {intelWhitelistModel} = require('../Model/IntelWhitelistModel')

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


async function getWhitelist() {
    try{
        const likeData = await client.v2.tweetLikedBy('1491075693509492741');
        const retweetData = await client.v2.tweetRetweetedBy('1491075693509492741');
        const likeUsers = likeData.data;
        const retweetUsers = retweetData.data;
        let result = likeUsers.filter(o1 => retweetUsers.some(o2 => o1.id === o2.id));

        
        const replyData = await client.v2.search("conversation_id:1491075693509492741", {"tweet.fields" : "author_id"});
        const replies = replyData._realData.data;
        console.log(replies)
        const userToWallet = {};
        const lists = replies.filter(o1 => result.some(o2 => o1.author_id === o2.id)).map(reply => {
            const n = reply.text.match(/0x[a-zA-Z0-9]{40}/);
            if(n) {
                reply.text = n[0];
                userToWallet[reply.author_id] = reply.text;
                return reply;
            }
        });

        lists.sort(() => Math.random() - Math.random()).slice(0, 1999);
        lists.map(async (list) => {
            try{
                const data = new intelWhitelistModel({
                    user : list.author_id,
                    wallet : list.text
                })
                await data.save()
            } catch(err) {}
        })

        
    } catch(err) {
        console.log(err)
    }
}

module.exports = {
    client,
    createTweet,
    getWhitelist
}