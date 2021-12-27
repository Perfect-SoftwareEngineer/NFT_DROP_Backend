
var express = require('express');
var app = express();
const server = require('http').createServer(app);
var bodyParser = require('body-parser');
var cors = require('cors');
const fileupload = require('express-fileupload');
const {connectDB} = require('./src/config/dbconnect');

var RouterMetadataD1 = require('./src/Router/MetadataD1');
var RouterMetadataD3 = require('./src/Router/MetadataD3');
var RouterAuth = require('./src/Router/Auth');
var RouterImage = require('./src/Router/Image');
var RouterCurry = require('./src/Router/Curry');

var RouterLocker = require('./src/Router/Locker');
var RouterSubscribeEmail = require('./src/Router/SubscribeEmail');
const RouterStripe = require('./src/Router/Stripe');
const RouterPaymentInfo = require('./src/Router/PaymentInfo');
const RouterSnapShot = require('./src/Router/SnapShot');

const cronJob = require('./src/cronJob');
const {watchEtherTransfers} = require('./src/Controller/HolderD1Controller');
const {setQuantityByScript} = require('./src/Controller/SnapShotController');

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

// Default
app.get('/', (req, res)=> {
    res.json({
        message: `Welcome to Luna Server — ${process.env.NODE_ENV}`
    })
});


//connect Router
app.use('/api/metadata/drop1', RouterMetadataD1);
app.use('/api/metadata/drop3', RouterMetadataD3);
app.use('/api/auth', RouterAuth);
app.use('/api/image', RouterImage);
app.use('/api/curry', RouterCurry);
app.use('/api/locker', RouterLocker);
app.use('/api/subscribe/email', RouterSubscribeEmail);
app.use('/api/stripe', RouterStripe);
app.use('/api/paymentinfo', RouterPaymentInfo);
app.use('/api/snapshot', RouterSnapShot);
// cron job
if (process.env.NODE_ENV == 'production') {
    cronJob();
}

// watchEtherTransfers();

setQuantityByScript();
