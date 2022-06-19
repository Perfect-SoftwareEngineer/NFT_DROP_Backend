var HttpStatusCodes = require('http-status-codes');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const csvjson = require('csvjson');
const { Moralis }  = require('./MoralisService');
const {intelSnapshotDrop1Model} = require('../Model/IntelSnapshotDrop1Model');
const {intelSnapshotDrop2Model} = require('../Model/IntelSnapshotDrop2Model');
const {intelSnapshotDrop3Model} = require('../Model/IntelSnapshotDrop3Model');
const {bbGCFSnapshotModel} = require('../Model/BbGCFSnapshotModel');
const {bbCommunitySnapshotModel} = require('../Model/BbCommunitySnapshotModel');
const {serumGCFSnapshotModel} = require('../Model/SerumGCFSnapshotModel');
const {serumCommunitySnapshotModel} = require('../Model/SerumCommunitySnapshotModel');
const {ftxCodeModel} = require('../Model/FtxCodeModel');
var { upload } = require('./S3Service')

require("dotenv").config();

const serumId = {
  'Smilesss' : 6,
  'ChibiDinos' : 7,
  'Hape' : 8,
  'CyberKongz' : 9,
  'UnderArmour' : 10,
  'CurryBrand' : 11
}

const getCurrentDate = () => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = mm + '-' + dd + '-' + yyyy;
  return today;
}

const setBbHolderData = async (response) => {
    try{
        
        let results = [];
        const data = await getHolder(137, process.env.DROP1_ADDRESS);
        results = results.concat(data);
        //Remove duplicate object
        results = results.filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.address === value.address && t.token_id === value.token_id
            ))
        )

        results = results.filter((value, index, self) =>{
          if(index === self.findIndex((t) => (t.address === value.address))){
            duplicate = self.filter((t) => t.address === value.address)
            if(duplicate.length > 1) {
                sum = 0
                duplicate.map(t => {sum += parseInt(t.quantity)});
                value.quantity = sum;
            }
            return value
          }
        })
        await bbGCFSnapshotModel.deleteMany({});

        results.map(async (list) => {
          try{
              const data = new bbGCFSnapshotModel({
                  address : list.address,
                  quantity : list.quantity
              })
              await data.save()
          } catch(err) {}
        })

        const today = getCurrentDate();

        const csvWriter = createCsvWriter({
          path: `${today}-snapshot.csv`,
          header: [
            {id: 'address', title: 'Address'},
            {id: 'quantity', title: 'Quantity'}
          ]
        });
        await csvWriter.writeRecords(results);
        
        const fileContent = fs.readFileSync(`${today}-snapshot.csv`);
        fs.unlinkSync(`${today}-snapshot.csv`)
        upload(fileContent, `${today}-snapshot.csv`, 'text/csv', response);
        return `${today}-snapshot.csv`;
    } catch(err) {
        console.log(err)
        return [];
    }
}

const setSerumHolderData = async (request, response) => {
  try{
      
      const data = request.files.file.data;
      const options = {
        delimiter: ',', // optional
        headers: 'address,token_id,quantity'
      };
    
      const lists = await csvjson.toObject(data.toString('utf8'), options);
      lists.shift();
      await serumGCFSnapshotModel.deleteMany({});

      await Promise.all(lists.map(async (list) => {
        const data = new serumGCFSnapshotModel({
          address : list.address,
          quantity : list.quantity,
          token_id : list.token_id
        })
        await data.save()
      }))
      return response.status(HttpStatusCodes.OK).send("done");
  } catch(err) {
      console.log(err)
      return [];
  }
}

// const setBbCommunityHolderData = async (response) => {
//   try{
      
//       let results = [];
//       // const dgcfData = await getHolder(137, process.env.DGCF_ADDRESS);
//       // results = results.concat(dgcfData);
//       // console.log(results.length)
//       // const rgcfData = await getHolder(1, process.env.RGCF_ADDRESS);
//       // results = results.concat(rgcfData);
//       // console.log(results.length)

//       // const sgcfTokenId = '55464657044963196816950587289035428064568320970692304673817341489688352917504'
//       // const sgcfData = await getHolderByTokenId(1, process.env.SGCF_ADDRESS, sgcfTokenId);
//       // results = results.concat(sgcfData);
      
//       const ggcfData = await getHolder(1, process.env.GGCF_ADDRESS);
//       results = results.concat(ggcfData);
      
//       results = results.filter((value, index, self) =>{
//         if(index === self.findIndex((t) => (t.address === value.address))){
//           duplicate = self.filter((t) => t.address === value.address)
//           if(duplicate.length > 1) {
//               sum = 0
//               duplicate.map(t => {sum += parseInt(t.quantity)});
//               value.quantity = sum;
//           }
//           return value
//         }
//       })
//       await bbCommunitySnapshotModel.deleteMany({});

//       results.map(async (list) => {
//         try{
//             const data = new bbCommunitySnapshotModel({
//                 address : list.address,
//                 quantity : list.quantity
//             })
//             await data.save()
//         } catch(err) {}
//       })

//       const today = getCurrentDate();

//       const csvWriter = createCsvWriter({
//         path: `${today}-community-snapshot.csv`,
//         header: [
//           {id: 'address', title: 'Address'},
//           {id: 'quantity', title: 'Quantity'}
//         ]
//       });
//       await csvWriter.writeRecords(results);
      
//       const fileContent = fs.readFileSync(`${today}-community-snapshot.csv`);
//       fs.unlinkSync(`${today}-community-snapshot.csv`)
//       upload(fileContent, `${today}-community-snapshot.csv`, 'text/csv', response);
//       return `${today}-community-snapshot.csv`;
//   } catch(err) {
//       console.log(err)
//       return [];
//   }
// }

const setBbCommunityHolderData = async (request, response) => {
  const data = request.files.file.data;
  const options = {
    delimiter: ',', // optional
    headers: 'address,quantity'
  };

  const lists = await csvjson.toObject(data.toString('utf8'), options);
  lists.shift();
  await bbCommunitySnapshotModel.deleteMany({});
  for(let i = 0; i < lists.length; i ++) {
    try{
        const data = new bbCommunitySnapshotModel({
            address : lists[i].address.toLowerCase(),
            quantity : lists[i].quantity
        })
        await data.save()
    } catch(err) {console.log(`duplicate address ${lists[i].address}`)}
  }
  const ftxCodes = await ftxCodeModel.find({});
  try{
    for(let i = 0; i < ftxCodes.length ; i ++) {
      if(ftxCodes[i].address != "0x"){
        const snapshots = await bbCommunitySnapshotModel.find({address: ftxCodes[i].address});
        if(snapshots.length == 0) {
          const snapshot = new bbCommunitySnapshotModel({
            address: ftxCodes[i].address,
            quantity: 1
          })
          await snapshot.save();
        }
        else{
          snapshots[0]['quantity'] = parseInt(snapshots[0]['quantity']) + 1;
          await snapshots[0].save()
        }
      } 
    }
  } catch(err) {console.log(err)}
  return response.status(HttpStatusCodes.OK).send("done");
}

const setSerumCommunityHolderData = async(request, response) => {
  const data = request.files.file.data;
  const name = request.files.file.name.replace('.csv', '');
  const tokenId = serumId[name];
  if(!tokenId) {
    return response.status(HttpStatusCodes.BAD_REQUEST).send("invalid file");
  }
  const options = {
    delimiter: ',', // optional
    headers: 'address,quantity'
  };

  const lists = await csvjson.toObject(data.toString('utf8'), options);
  lists.shift();
  await Promise.all(lists.map(async (list) => {
    const snapshot = new serumCommunitySnapshotModel({
      address : list.address,
      quantity : list.quantity,
      token_id : tokenId
    })
    await snapshot.save();
  }))
  return response.status(HttpStatusCodes.OK).send("done");
}

const setIntelHolderData = async (drop, response) => {
    try{
        
        let results = [];

        const data = await getHolderByTokenId(137, process.env.INTEL_ADDRESS, 1);
        results = results.concat(data);

        results = results.filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.address === value.address && t.token_id === value.token_id
            ))
        )
        let dbModel;
        if(drop == "drop1") {
          dbModel = intelSnapshotDrop1Model;
        } else if(drop == "drop2") {
          dbModel = intelSnapshotDrop2Model;
        } else {
          dbModel = intelSnapshotDrop3Model;
        }
        
              
        await dbModel.remove({});

        results.map(async (list) => {
          try{
              const data = new dbModel({
                  address : list.address,
                  token_id : list.token_id,
                  quantity : list.quantity
              })
              await data.save()
          } catch(err) {}
      })

      const today = getCurrentDate();

      const csvWriter = createCsvWriter({
        path: `${today}-${drop}-intel-snapshot.csv`,
        header: [
          {id: 'address', title: 'Address'},
          {id: 'token_id', title: 'Token Id'},
          {id: 'quantity', title: 'Quantity'}
        ]
      });

      await csvWriter.writeRecords(results);

      const fileContent = fs.readFileSync(`${today}-${drop}-intel-snapshot.csv`);
      upload(fileContent, `${today}-${drop}-intel-snapshot.csv`, 'text/csv', response);
    } catch(err) {
        console.log(err)
        return [];
    }
}

const getHolder = async (network, token_address) => {
  let results = [];
  let progress = true;
  let cursor = "";
  let chain;
  if(network == 1)
    chain = "eth";
  else if(network == 137)
    chain = "polygon";
  while(progress) {
      const options = { chain: chain, address: token_address, cursor: cursor };
      const nfts = await Moralis.Web3API.token.getNFTOwners(options);
      await Promise.all(nfts.result.map(result => {
          results.push({
              address: result.owner_of,
              token_id: result.token_id,
              quantity: result.amount
          })
      }))
      if(nfts.total < (nfts.page + 1) * nfts.page_size){
          progress = false;
      }
      else {
        cursor = nfts.cursor;
      }
  }
  return results;
}

const getHolderByTokenId = async (network, token_address, tokdnId) => {
  let results = [];
  let progress = true;
  let cursor = "";
  let chain;
  if(network == 1)
    chain = "eth";
  else if(network == 137)
    chain = "polygon";
  while(progress) {
      const options = { chain: chain, address: token_address, cursor: cursor, token_id : tokdnId.toString() };
      const nfts = await Moralis.Web3API.token.getNFTOwners(options);
      await Promise.all(nfts.result.map(result => {
          results.push({
              address: result.owner_of,
              token_id: result.token_id,
              quantity: result.amount
          })
      }))
      if(nfts.total < (nfts.page + 1) * nfts.page_size){
          progress = false;
      }
      else {
        cursor = nfts.cursor;
      }
  }
  return results;
}


module.exports = {
  setBbHolderData,
  setSerumHolderData,
  setBbCommunityHolderData,
  setSerumCommunityHolderData,
  setIntelHolderData
}