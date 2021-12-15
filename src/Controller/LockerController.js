var HttpStatusCodes = require('http-status-codes');
const gql = require('graphql-request');
const Moralis  = require('moralis/node');
const Web3 = require("web3");
var {holderD1Model} = require('../Model/HolderD1Model')
var ERC721ABI = require('../config/ABI/ERC721');

require("dotenv").config();

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.POLYGON_HTTP_NODE));

const subgraphAPIURL = 'https://api.thegraph.com/subgraphs/name/pixowl/the-sandbox'

const serverUrl = process.env.MORALIS_SERVER_URL;
const appId = process.env.MORALIS_APP_ID;
Moralis.start({ serverUrl, appId });

const decentTokenIds = [
  "210624583337114373395836055367340864637790190801098222508622021957",
  "210624583337114373395836055367340864637790190801098222508622013296"
]
const sandboxTokenId = "55464657044963196816950587289035428064568320970692304673817341489687908321280";
const galaTokenId = "38154640969901016166130090617297893851136";

const getNft = async (request, response) => {
  try {

    const {
      wallet
    } = request.params;
    const drop1Data = await holderD1Model.find({wallet: wallet.toLowerCase(), contract: process.env.DROP1_ADDRESS});
    const decentData = await getDecentralandData(wallet);
    const sandboxData = await getSandboxData(wallet);
    const galaData = await getGalaData(wallet);
    const nftData = [...drop1Data, ...decentData, ...sandboxData, ...galaData];
    return response.status(HttpStatusCodes.OK).send(nftData);
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

const getDecentralandData = async (wallet) => {
  const nftContract = new web3.eth.Contract(ERC721ABI, '0x66194b1abcbfbedd83841775404b245c8f9e4183');

  const balance = await nftContract.methods.balanceOf(wallet).call();
  const data = [];
  const tokenIds = [];
  let uri = "";
  let quantity = 0;
  for (let i = 0; i < balance; i++) {
    let tokenId = await nftContract.methods.tokenOfOwnerByIndex(wallet, i).call();
    
    if( decentTokenIds.includes(tokenId.toString()) ) {
      if(uri == "")
        uri = await nftContract.methods.tokenURI(tokenId).call();
      tokenIds.push(tokenId);
      quantity ++;
    }
  }
  data.push({
    wallet: wallet,
    platfrom: "decentaland",
    tokenId: tokenIds,
    uri: uri,
    quantity: Number(quantity)
  })
  return data;
}

const getSandboxData = async (wallet) => {
  tokensQuery = `
    query($account: String, $tokenId: String) {
      owner(id : $account) {
        assetTokens(where: {token: $tokenId}){
          token{
            id
            collection{
              tokenURI
            }
          }
          quantity
        }
      }
    }
  `
  const variables = { account : wallet.toLowerCase(), tokenId : sandboxTokenId};
  const result = await gql.request(subgraphAPIURL, tokensQuery, variables)
  if(result.owner) {
    const data = result.owner.assetTokens.map(asset => {
      return {
        wallet: wallet,
        platfrom: "sandbox",
        tokenId: asset.token.id,
        uri: 'https://gateway.pinata.cloud/' + asset.token.collection.tokenURI.replace("://", "/"),
        quantity: asset.quantity
      }
    })
    return data;
  } else {
    return [];
  }
}

const getGalaData = async (wallet) => {
  try{
    const options = { chain: 'eth', address: wallet, token_address: '0xc36cf0cfcb5d905b8b513860db0cfe63f6cf9f5c', token_id: galaTokenId };
    const nfts = await Moralis.Web3API.account.getNFTsForContract(options);
    if(nfts.result) {
      const data = nfts.result.map(asset => {
        return {
          wallet: wallet,
          platfrom: "gala",
          tokenId: asset.token_id,
          uri: asset.token_uri,
          quantity: asset.amount
        }
      })
      return data;
    }
    return [];
  } catch(err) {
    return [];
  }
}
module.exports = {
  getNft
}