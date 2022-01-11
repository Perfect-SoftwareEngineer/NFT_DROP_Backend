const csvjson = require('csvjson');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: 'output/rkl-full-snap-final.csv',
    header: [
        {id: 'address', title: 'address'},
        {id: 'quantity', title: 'quantity'}
    ]
});

const getSnapshots = ()=> {
    const data = fs.readFileSync(path.join(__dirname, 'input/rkl_snapshot_final.csv'), { encoding: 'utf8' });
    const options = {
        delimiter: ',', // optional
        headers: 'address,tokenId,quantity'
    };

    const snapshots = csvjson.toObject(data, options);
    snapshots.shift(); // remove headers
    
    return snapshots;
}

const main = ()=> {
    const snapshots = getSnapshots();
    // Transform here
    const map = {};
    
    for (let i = 0; i < snapshots.length; i++) {
        let snap = snapshots[i];
        let { address, quantity } = snap;
        
        address = address.toLowerCase();
        
        if (map[address]) {
            map[address] = map[address] + parseInt(quantity);
            // console.log({ [address]: parseInt(quantity) });
        } else {
            map[address] = parseInt(quantity);
        }
    }
    
    let mapObjs = [];
    let keys = Object.keys(map);
    let sum = 0;
    
    for (let i = 0; i < keys.length; i++) {
        let k = keys[i];
        let record = {
            address: k,
            quantity: map[k]
        };
        
        mapObjs.push(record);
        sum += map[k];
    }
    // console.log({ sum });
    
    // write to CSV
    csvWriter.writeRecords(mapObjs)       // returns a promise
    .then(() => {
        console.log('Finished writing CSV');
    });
}

main();