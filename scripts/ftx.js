
const { connect, disconnect } = require('mongoose');
const log4js = require("log4js");

const dotenv = require('dotenv');

const { ftxStatusModel } = require("../src/Model/FtxStatusModel");

dotenv.config({ path: './../.env'});


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

const enable = async () => {
    await connectDB();

    var logger = log4js.getLogger();
    logger.level = "all";
    try{
        await ftxStatusModel.deleteMany({});
        const data = new ftxStatusModel({
            status: true
        })
        await data.save();
        logger.info("done");
        await disconnectDB();
    } catch (err) {
        console.log(err)
    }
}

const disable = async () => {
    await connectDB();

    var logger = log4js.getLogger();
    logger.level = "all";
    try{
        const data = await ftxStatusModel.find({status: true}).limit(1);
        if(data.length > 0) {
            data[0].status = false;
            await data[0].save();
            logger.info("done");
        }
        else {
            logger.error("ftx already disabled");
        }
        
        await disconnectDB();
    } catch (err) {
        console.log(err)
    }
}

const main = () => {
    const args = process.argv;
    switch(args[2].toLocaleLowerCase()) {
        case "enable":
            enable();
            break;
        case "disable":
            disable();
            break;
    }
}


main()