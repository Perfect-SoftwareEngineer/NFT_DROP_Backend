const { TwitterApi } = require('twitter-api-v2');
const fs = require("fs");
let csv = require("fast-csv");
var {intelWhitelistModel} = require('../Model/IntelWhitelistModel')
var {intelWhitelistLikeModel} = require('../Model/IntelWhitelistLikeModel')
var {intelWhitelistRetweetModel} = require('../Model/IntelWhitelistRetweetModel')


var stream = fs.createReadStream("./holders.csv");

// Instantiate Twitter API
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const clientV2 = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

const delay = ms => new Promise(res => setTimeout(res, ms));

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


async function getLikes(tweetUrl) {
    let progress = true;
    let nextToken = "";
    let waitingTime = 0;
    let count = 0;
    while(progress) {
        try {
            let data;
            if(nextToken == "") {
                data = await clientV2.v2.tweetLikedBy(tweetUrl);
            }
            else {
                data = await clientV2.v2.tweetLikedBy(tweetUrl, {"pagination_token" : nextToken});
            }
            if(data.data) {
                count += data.data.length;
                data.data.map(async (like) => {
                    try{
                        const like_data = new intelWhitelistLikeModel({
                            id: like.id,
                            name: like.name,
                            username: like.username
                        })
                        await like_data.save()
                    } catch(err) {/*console.log(err)*/}
                })
            }
            nextToken = data.meta.result_count == 0 ? "" : data.meta.next_token;
            progress = data.meta.result_count == 0 || count > 5000 ? false : true;
            
            waitingTime = 0;
        } catch(err) {
            if(err.code == 429) {
                const resetTime = err.rateLimit.reset;
                const currentTime = parseInt((new Date().getTime())/1000);
                waitingTime = resetTime - currentTime;
            }
        } finally {
            if(waitingTime > 0) {
                console.log(`Timeout ${waitingTime} seconds bcz of Twitter API call limitation`);
                await delay(waitingTime * 1000);
                waitingTime = 0;
            }
        }
    }
}

async function getRetweets(tweetUrl) {
    let progress = true;
    let nextToken = "";
    let count = 0;
    let waitingTime = 0;
    while(progress) {
        try{
            let data;
            if(nextToken == "") {
                data = await clientV2.v2.tweetRetweetedBy(tweetUrl);
            }
            else {
                data = await clientV2.v2.tweetRetweetedBy(tweetUrl, {"pagination_token" : nextToken});
            }
            if(data.data) {
                count += data.data.length;
                data.data.map(async (retweet) => {
                    try{
                        const retweet_data = new intelWhitelistRetweetModel({
                            id: retweet.id,
                            name: retweet.name,
                            username: retweet.username
                        })
                        await retweet_data.save()
                    } catch(err) {}
                })
            }
            nextToken = data.meta.result_count == 0 ? "" : data.meta.next_token;
            progress = data.meta.result_count == 0 || count > 5000 ? false : true;
            waitingTime = 0;
        } catch(err) {
            if(err.code == 429) {
                const resetTime = err.rateLimit.reset;
                const currentTime = parseInt((new Date().getTime())/1000);
                waitingTime = resetTime - currentTime;
                console.log(waitingTime);
            }
        } finally {
            if(waitingTime > 0) {
                console.log(`Timeout ${waitingTime} seconds bcz of Twitter API call limitation`);
                await delay(waitingTime * 1000);
                waitingTime = 0;
            }
        }
        
    }
}

async function getReplies(tweetUrl) {
    console.log("here replies")
    let progress = true;
    let nextToken = "";
    let replies = [];
    let waitingTime = 0;
    while(progress) {
        try{
            let data;
            if(nextToken == "") {
                data = await clientV2.v2.search(`conversation_id:${tweetUrl}`, {"tweet.fields" : "author_id", "max_results" : "100"});
            }
            else {
                data = await clientV2.v2.search(`conversation_id:${tweetUrl}`, {"tweet.fields" : "author_id", "max_results" : "100", "pagination_token" : nextToken});
            }
            
            nextToken = data._realData.meta.result_count == 0 ? "" : data._realData.meta.next_token;
            progress = data._realData.meta.result_count == 0 || replies.length > 5000 ? false : true;
            replies = replies.concat(data._realData.data);
            waitingTime = 0;
        } catch(err) {
            if(err.code == 429) {
                const resetTime = err.rateLimit.reset;
                const currentTime = parseInt((new Date().getTime())/1000);
                waitingTime = resetTime - currentTime;
            }
        } finally {
            if(waitingTime > 0) {
                console.log(`Timeout ${waitingTime} seconds bcz of Twitter API call limitation`);
                await delay(waitingTime * 1000);
                waitingTime = 0;
            }
        }
    }
    return replies;
}

async function getWhitelist() {
    try{
        
        await getLikes('1494410066300227585');
        
        await getRetweets('1494410066300227585');
        
        const likeUsers = await intelWhitelistLikeModel.find({});
        const retweetUsers = await intelWhitelistRetweetModel.find({});
        let result = likeUsers.filter(o1 => retweetUsers.some(o2 => o1.id === o2.id));
        
        const replies = await getReplies('1494410066300227585');
        // const replies = replyData._realData.data;
        const userToWallet = {};
        const lists = replies.filter(o1 => result.some(o2 => o1.author_id === o2.id)).map(reply => {
            const n = reply.text.match(/0x[a-zA-Z0-9]{40}/);
            if(n) {
                reply.text = n[0];
                userToWallet[reply.author_id] = reply.text;
                return reply;
            }
        });

        lists.sort(() => Math.random() - Math.random()).slice(0, 2000);
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


function getHolders() {
    return new Promise((resolve, reject) => {
      let address = [];
      let data = [];
      csv
        .parseStream(stream, { headers: true })
        .on("data", function (data) {
          address.push(data["HolderAddress"]);
        })
        .on("end", function () {
          console.log("done");
          data[0] = address;
              resolve(data);
        });
    });
  }

async function setMockWhitelist() {
    const data = await getHolders();
    const addresses = data[0];
    let i = 0;
    addresses.slice(0, 2000).map(async (addr) => {
        try{
            const data = new intelWhitelistModel({
                user : i++,
                wallet : addr
            })
            await data.save()
        } catch(err) {}
    })
}
module.exports = {
    client,
    createTweet,
    getWhitelist,
    setMockWhitelist
}