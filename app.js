
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var cors = require('cors');
var fileupload = require('express-fileupload');
var swaggerUI = require('swagger-ui-express');
var swaggerJsDoc = require('swagger-jsdoc');

var {connectDB} = require('./src/config/dbconnect');

var RouterMetadataD1 = require('./src/Router/MetadataD1');
var RouterMetadataD3 = require('./src/Router/MetadataD3');
var RouterMetadataGala = require('./src/Router/MetadataGala');
var RouterMetadataIntel = require('./src/Router/MetadataIntel');
var RouterMetadataBB = require('./src/Router/MetadataBB');
var RouterMetadataSerum = require('./src/Router/MetadataSerum');

var RouterAuth = require('./src/Router/Auth');
var RouterUser = require('./src/Router/User');
var RouterImage = require('./src/Router/Image');
var RouterCurry = require('./src/Router/Curry');

var RouterLocker = require('./src/Router/Locker');
var RouterSubscribeEmail = require('./src/Router/SubscribeEmail');
var RouterStripe = require('./src/Router/Stripe');
var RouterPaymentInfo = require('./src/Router/PaymentInfo');
var RouterSnapShot = require('./src/Router/SnapShot');

var RouterMerkleIntel = require('./src/Router/MerkleIntel');
var RouterMerkleCurryV2 = require('./src/Router/MerkleCurryV2');

var RouterFreeBB = require('./src/Router/FreeBB');
var RouterCurrentMatch = require('./src/Router/CurrentMatch')
var cronJob = require('./src/cronJob');
var {getWhitelist, setMockWhitelist} = require('./src/cronJob/twitter');

require("dotenv").config();


const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Library API",
            version: "1.0.0",
            description: "Express API server"
        },
        servers: [
            {
                url: "https://backend.lunamarket.io/"
            },
            {
                url: "https://staging.backend.lunamarket.io/"
            },
            {
                url: "http://localhost:5000/"
            }
        ]       
    },
    apis: ["./src/router/*.js"]
}

const specs = swaggerJsDoc(options);

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
app.use('/api/metadata/gala', RouterMetadataGala);
app.use('/api/metadata/intel', RouterMetadataIntel);
app.use('/api/metadata/basketball', RouterMetadataBB);
app.use('/api/metadata/serum', RouterMetadataSerum);
app.use('/api/curryv2/free/basketball', RouterFreeBB);
app.use('/api/auth', RouterAuth);
app.use('/api/user', RouterUser);
app.use('/api/image', RouterImage);
app.use('/api/curry', RouterCurry);
app.use('/api/locker', RouterLocker);
app.use('/api/subscribe/email', RouterSubscribeEmail);
app.use('/api/stripe', RouterStripe);
app.use('/api/paymentinfo', RouterPaymentInfo);
app.use('/api/snapshot', RouterSnapShot);
app.use('/api/intel/merkle', RouterMerkleIntel);
app.use('/api/curryv2/merkle', RouterMerkleCurryV2);
app.use('/api/curryv2/current/match', RouterCurrentMatch);
//swagger doc
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

// cron job
// if (process.env.NODE_ENV == 'production') {
    cronJob();
// }

module.exports = app;