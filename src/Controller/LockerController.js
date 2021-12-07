var HttpStatusCodes = require('http-status-codes');
const gql = require('graphql-request');
const Moralis  = require('moralis/node');
const Web3 = require("web3");
var {holderD1Model} = require('../Model/HolderD1Model')
var ERC721ABI = require('../config/ABI/ERC721');

require("dotenv").config();

const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.POLYGON_NODE));

const subgraphAPIURL = 'https://api.thegraph.com/subgraphs/name/pixowl/the-sandbox'

const serverUrl = "https://kdsmurshlxp8.moralishost.com:2053/server";
const appId = "DHSndgGqJBQ4WEQnY0DLw6Mk3uQKP1ZaKWOLhAWP";
Moralis.start({ serverUrl, appId });

const getNft = async (request, response) => {
  try {

    const {
      wallet
    } = request.params;
    
    
    const drop1Data = await holderD1Model.find({wallet: wallet.toLowerCase()});
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
  
  for (let i = 0; i < balance; i++) {
    let tokenId = await nftContract.methods.tokenOfOwnerByIndex(wallet, i).call();
    const uri = await nftContract.methods.tokenURI(tokenId).call();
    data.push({
      wallet: wallet,
      tokenId: tokenId,
      uri: uri,
      quantity: 1
    })
  }
  return data;
}

const getSandboxData = async (wallet) => {
  tokensQuery = `
    query($account: String) {
      owner(id : $account) {
        assetTokens{
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
  const variables = { account : wallet.toLowerCase()};
  const result = await gql.request(subgraphAPIURL, tokensQuery, variables)
  if(result.owner) {
    const data = result.owner.assetTokens.map(asset => {
      return {
        wallet: wallet,
        tokenId: asset.token.id,
        uri: asset.token.collection.tokenURI,
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
    const options = { chain: 'eth', address: '0x381e840f4ebe33d0153e9a312105554594a98c42', token_address: '0xc36cf0cfcb5d905b8b513860db0cfe63f6cf9f5c', token_id: '154147912215185123948908697166590999789568' };
    const nfts = await Moralis.Web3API.account.getNFTsForContract(options);
    if(nfts.result) {
      const data = nfts.result.map(asset => {
        return {
          wallet: wallet,
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