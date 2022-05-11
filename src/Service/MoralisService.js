const Moralis  = require('moralis/node');

require("dotenv").config();


const serverUrl = process.env.MORALIS_SERVER_URL;
const appId = process.env.MORALIS_APP_ID;

Moralis.start({ serverUrl, appId });

module.exports = {
    Moralis
}