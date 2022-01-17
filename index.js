const app = require('./app');
const server = require('http').createServer(app);
const {connectDB} = require('./src/config/dbconnect');

require("dotenv").config();
//Create server 
const PORT = process.env.PORT || 5000
server.listen(PORT, async () => {
    console.log(`Listening on port ${PORT}...`)
    //connect db
    await connectDB();
});
