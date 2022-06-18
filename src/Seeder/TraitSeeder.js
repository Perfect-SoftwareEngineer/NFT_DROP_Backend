
const { connect, disconnect } = require('mongoose');

const dotenv = require('dotenv');
const { traitModel } = require("../Model/TraitModel");
const traits = require('../constants/Trait.json');

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
    await Promise.all(traits.map(async (trait) => {
        const _trait = new traitModel({
            id: trait.id,
            name: trait.name
        })
        await _trait.save();
    }));

}

const main = async () => {
    await connectDB();
    await seed();
    await disconnectDB();
}


main()