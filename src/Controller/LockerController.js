var HttpStatusCodes = require('http-status-codes');
const gql = require('graphql-request');
const Moralis  = require('moralis/node');
const Web3 = require("web3");
var {holderD1Model} = require('../Model/HolderD1Model')
var ERC721ABI = require('../config/ABI/ERC721');

require("dotenv").config();

const polygonNode = process.env.NODE_ENV == 'production' ? process.env.POLYGON_HTTP_NODE : process.env.POLYGON_HTTP_TEST_NODE;
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.POLYGON_HTTP_NODE));

const subgraphAPIURL = 'https://api.thegraph.com/subgraphs/name/pixowl/the-sandbox'

const serverUrl = process.env.MORALIS_SERVER_URL;
const appId = process.env.MORALIS_APP_ID;

Moralis.start({ serverUrl, appId });
const tokenAddress = process.env.NODE_ENV == 'production' ? process.env.DROP1_ADDRESS : process.env.DROP1_ADDRESS_TEST;

const decentTokenIds = [
  "210624583337114373395836055367340864637790190801098222508622021957",
  "210624583337114373395836055367340864637790190801098222508622013296"
]
const sandboxTokenId = "55464657044963196816950587289035428064568320970692304673817341489687908321280";
const galaTokenId = "138154640969901016166130090617297893851136";

const getNft = async (request, response) => {
  try {

    const {
      wallet
    } = request.params;
    const drop1Data = await getDropData(wallet);
    const decentData = await getDecentralandData(wallet);
    const sandboxData = await getSandboxData(wallet);
    const galaData = await getGalaData(wallet);
    const nftData = [...drop1Data, ...decentData, ...sandboxData, ...galaData];
    return response.status(HttpStatusCodes.OK).send(nftData);
  } catch(err) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
}

const getDropData = async (wallet) => {
  try{
    const chain = process.env.NODE_ENV == 'production' ? "polygon" : "mumbai";
    const options = { chain: chain, address: wallet, token_address: tokenAddress};
    const nfts = await Moralis.Web3API.account.getNFTsForContract(options);
    if(nfts.result) {
      const data = nfts.result.map(asset => {
        return {
          wallet: wallet,
          platform: "Drop1Nft",
          tokenId: asset.token_id,
          uri: asset.token_uri,
          quantity: asset.amount
        }
      })
      return data;
    }
    return [];
  } catch(err) {
    console.log(err)
    return [];
  }
}

const getDecentralandData = async (wallet) => {
  try{
    if(process.env.NODE_ENV != 'production') {
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
      if(quantity > 0) {
        data.push({
          wallet: wallet,
          platform: "decentraland",
          tokenId: tokenIds,
          uri: uri,
          quantity: Number(quantity)
        })
      }
      return data;
    } else {
      return [];
    }
  } catch {
    return [];
  }
}

const getSandboxData = async (wallet) => {
  if(process.env.NODE_ENV != 'production') {
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
          platform: "sandbox",
          tokenId: asset.token.id,
          uri: 'https://gateway.pinata.cloud/' + asset.token.collection.tokenURI.replace("://", "/"),
          quantity: asset.quantity
        }
      })
      return data;
    } else {
      return [];
    }
  } else {
    return [];
  }
}

const getGalaData = async (wallet) => {
  if(process.env.NODE_ENV != 'production') {
    try{
      const options = { chain: 'eth', address: wallet, token_address: '0xc36cf0cfcb5d905b8b513860db0cfe63f6cf9f5c', token_id: galaTokenId };
      const nfts = await Moralis.Web3API.account.getNFTsForContract(options);
      if(nfts.result) {
        const data = nfts.result.map(asset => {
          return {
            wallet: wallet,
            platform: "gala",
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
  else {
    return [];
  }
}
module.exports = {
  getNft
}