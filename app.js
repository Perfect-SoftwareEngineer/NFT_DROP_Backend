
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var cors = require('cors');
var fileupload = require('express-fileupload');
var swaggerUI = require('swagger-ui-express');
var swaggerJsDoc = require('swagger-jsdoc');

var RouterMetadata = require('./src/Router/Metadata');

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

var RouterCurryV2 = require('./src/Router/CurryV2')

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
app.use('/api/metadata', RouterMetadata);
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
app.use('/api/curryv2', RouterCurryV2);
//swagger doc
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

module.exports = app;