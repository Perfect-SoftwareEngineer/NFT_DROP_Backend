var HttpStatusCodes = require('http-status-codes');
const gql = require('graphql-request');

const Web3 = require("web3");
const {Moralis}  = require('./MoralisController');
var {holderD1Model} = require('../Model/HolderD1Model')
var ERC721ABI = require('../config/ABI/ERC721');

require("dotenv").config();

const polygonNode = process.env.NODE_ENV == 'production' ? process.env.POLYGON_HTTP_NODE : process.env.POLYGON_HTTP_TEST_NODE;
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.POLYGON_HTTP_NODE));

const subgraphAPIURL = 'https://api.thegraph.com/subgraphs/name/pixowl/the-sandbox'


const tokenAddress = process.env.NODE_ENV == 'production' ? process.env.DROP1_ADDRESS : process.env.DROP1_ADDRESS_TEST;
const galaTokenAddress = process.env.NODE_ENV == 'production' ? process.env.GALA_ADDRESS : process.env.GALA_ADDRESS_TEST;
const rklTokenAddress = process.env.RKL_ADDRESS;

const sandboxTokenId = "55464657044963196816950587289035428064568320970692304673817341489688352917504";

const getNft = async (request, response) => {
  try {

    const {
      wallet
    } = request.params;
    const drop1Data = await getDropData(wallet);
    const decentData = await getDecentralandData(wallet);
    const sandboxData = await getSandboxData(wallet);
    const galaData = await getGalaData(wallet);
    const rklData = await getRklData(wallet);
    // const galaData = [];
    const nftData = [...drop1Data, ...decentData, ...sandboxData, ...galaData, ...rklData];
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
    const nftContract = new web3.eth.Contract(ERC721ABI, '0x6609330d836cb64adf8fb54434e22a0323a11b4a');
    
    const balance = await nftContract.methods.balanceOf(wallet).call();
    console.log(balance)
    const data = [];
    const tokenIds = [];
    let uri = "";
    let quantity = 0;
    for (let i = 0; i < balance; i++) {
      let tokenId = await nftContract.methods.tokenOfOwnerByIndex(wallet, i).call();
      console.log(tokenId)
      if(tokenId >= 1 && tokenId <= 3100) {
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
  } catch {
    return [];
  }
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
}

const getGalaData = async (wallet) => {
  try{
    const chain = process.env.NODE_ENV == 'production' ? "eth" : "rinkeby";
    const options = { chain: chain, address: wallet, token_address: galaTokenAddress};
    const nfts = await Moralis.Web3API.account.getNFTsForContract(options);
    let quantity = 0;
    let uri ;
    if(nfts.result.length > 0) {
      
      nfts.result.map(asset => {
        quantity += Number(asset.amount);
        uri = asset.token_uri;
        
      })
      if(quantity > 0) {
        return [{
          wallet: wallet,
          platform: "gala",
          tokenId: [],
          uri: uri,
          quantity: quantity
        }]
      }
    }
    return [];
  } catch(err) {
    console.log(err)
    return [];
  }
}

const getRklData = async (wallet) => {
  try{
    const chain = process.env.NODE_ENV == 'production' ? "eth" : "rinkeby";
    const options = { chain: chain, address: wallet, token_address: rklTokenAddress};
    const nfts = await Moralis.Web3API.account.getNFTsForContract(options);
    let quantity = 0;
    let uri ;
    if(nfts.result.length > 0) {
      
      nfts.result.map(asset => {
        quantity += Number(asset.amount);
        uri = asset.token_uri;
        
      })
      if(quantity > 0) {
        return [{
          wallet: wallet,
          platform: "rkl",
          tokenId: [],
          uri: uri,
          quantity: quantity
        }]
      }
    }
    return [];
  } catch(err) {
    console.log(err)
    return [];
  }
}
module.exports = {
  getNft
}