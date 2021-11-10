const { connect } = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Database connecting ...');
    const production = process.env.NODE_ENV === 'production';
    const options = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    };

    await connect(
      production ? process.env.MONGODB_URI : `mongodb://localhost/under_armour`,
      options,
    );
    console.log('MongoDB connected!');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = {
  connectDB
};
