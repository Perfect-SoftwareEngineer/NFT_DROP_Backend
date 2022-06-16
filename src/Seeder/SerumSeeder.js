
const { connect, disconnect } = require('mongoose');

const dotenv = require('dotenv');
const { serumModel } = require("../Model/SerumModel");
const serums = require('../constants/Serum.json');

dotenv.config({ path: './../../.env'});

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

const disconnectDB = async () => {
    try {
        await disconnect();
    } catch(error) {
        console.error(error.message);
        process.exit(1);
    }
}

const seed = async () => {
    await Promise.all(serums.map(async (serum) => {
        const _serum = new serumModel({
            id: serum.id,
            name: serum.name
        })
        await _serum.save();
    }));

}

const main = async () => {
    await connectDB();
    await seed();
    await disconnectDB();
}


main()