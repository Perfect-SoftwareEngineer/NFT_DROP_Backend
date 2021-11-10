
var express = require('express');
var app = express();
const server = require('http').createServer(app);
var bodyParser = require('body-parser');
var cors = require('cors');
const fileupload = require('express-fileupload');
const {connectDB} = require('./src/config/dbconnect');

var RouterMetadataD1 = require('./src/Router/MetadataD1');
var RouterMetadataD3 = require('./src/Router/MetadataD3');

require("dotenv").config();
//Create server 
const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Listening on port ${PORT}...`));

//connect db
connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(fileupload());


//connect Router
app.use('/api/metadata/drop1', RouterMetadataD1);
app.use('/api/metadata/drop3', RouterMetadataD3);
