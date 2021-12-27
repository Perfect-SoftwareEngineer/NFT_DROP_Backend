const csvjson = require('csvjson');
const fs = require('fs');
const path = require('path');
const { connect } = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './../.env'});
const { snapshotModel } = require('../src/Model/1226Snapshot');

const connectDB = async () => {
  try {
    console.log(`Database connecting to ${process.env.NODE_ENV} environment.`);
    const production = process.env.NODE_ENV === 'production';
    const options = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    };
    
    await connect(
      production ? process.env.MONGODB_PROD_URI : process.env.MONGODB_DEV_URI,
      options,
    );
    console.log('MongoDB connected!');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

const getSnapshots = ()=> {
    const data = fs.readFileSync(path.join(__dirname, 'input/12_26_8pm_snapshot.csv'), { encoding: 'utf8' });
    const options = {
        delimiter: ',', // optional
        headers: 'address,tokenId,quantity'
    };

    const snapshots = csvjson.toObject(data, options);
    snapshots.shift(); // remove headers
    
    return snapshots;
}

const formatSnapshot = (snapshot)=> {
    let newObj = {};
    let { address, tokenId, quantity } = snapshot;
    
    return {
        address: address.toLowerCase(),
        tokenId: parseInt(tokenId),
        quantity: parseInt(quantity)
    }
}

const main = async ()=> {
    try {
        await connectDB();
        const snapshots = getSnapshots();
        
        for (snapshot of snapshots) {
            let formatted = formatSnapshot(snapshot);
            
            const existing = await snapshotModel.findOne({
                address: formatted.address,
                tokenId: formatted.tokenId,
                quantity: formatted.quantity
            });
            
            if (!existing) {
                await snapshotModel.create(formatted);
            } else {
                console.log("found existing.");
                console.log({
                    address: existing.address,
                    tokenId: existing.tokenId,
                    quantity: existing.quantity
                })
            }
        }
        console.log("finished!");
    } catch(e) {
        
    }
}

main();
