var express = require('express');
var router = express.Router();
var {getTokenId, get, getAll, getCount, create, update} = require('../Controller/PaymentInfoController');
var MiddlewareAuth = require('../Middleware/MiddlewareAuth')


/**
 * @swagger
 * components: 
 *  schemas:
 *      PaymentInfo:
 *          type: object
 *          required:
 *              - email
 *              - wallet
 *              - ip
 *              - country_name
 *              - date
 *          properties:
 *              _id: 
 *                  type: string
 *                  description: The id of the payment info
 *              email:
 *                  type: string
 *                  description: The email address of the user
 *              wallet:
 *                  type: string
 *                  description: The wallet address of user who get the nft
 *              status:
 *                  type: string
 *                  description: The status of nft transfer (pending, transferred)
 *              ip:
 *                  type: string
 *                  description: The ip address of the user (CHINA ip address banned)
 *              country_name:
 *                  type: string
 *                  description: The country name of the user
 *              date:
 *                  type: string
 *                  description: The date of purchase
 *              tokenId:
 *                  type: string
 *                  description: The tokenId that will receive 
 *              txHash:
 *                  type: string
 *                  description: The nft transfer transaction hash
 *          example:
 *              _id: "61bf9a75fce72f233a5410be"
 *              email: "naeucop@gmail.com"
 *              wallet: "0x01dedef3eafb580d95a58006e9061929c1505259"
 *              status: "transferred"
 *              ip: "172.112.178.246"
 *              country_name: "United States"
 *              date: "2021-12-21T21:35:51.000Z"
 *              tokenId: "4"
 *              txHash: "0x904cb9fbfa5995f757bae9d2667721655e87822c94af4498dc7f02f885307cd6"
 */



router.post('/approve', async(request, response) => {
    getTokenId(request, response);
});

/**
 * @swagger
 * /api/paymentinfo/getCount:
 *   get:
 *     summary: Returns the count of the payment info
 *     responses:
 *       200:
 *         description: The count of payment info
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: {count:2}
 *               
 */

router.get('/getCount', async(request, response) => {
    getCount(request, response);
});

/**
 * @swagger
 * /api/paymentinfo/getAll:
 *   get:
 *     summary: Returns all paymentinfo
 *     responses:
 *       200:
 *         description: The list of the paymentinfo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PaymentInfo'
 */
router.get('/getAll', async(request, response) => {
    getAll(request, response);
});

/**
 * @swagger
 * /api/paymentinfo/{_id}:
 *   get:
 *     summary: Returns the paymentinfo by id
 *     responses:
 *       200:
 *         description: The paymentinfo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PaymentInfo'
 */
router.get('/get/:_id', async(request, response) => {
    get(request, response);
});


/**
 * @swagger
 * /api/paymentinfo/create:
 *   post:
 *      summary: Create a new payment information
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - email
 *                          - wallet
 *                          - ip
 *                          - country_name
 *                          - date
 *                      properties:
 *                          email:
 *                              type: string
 *                              description: The email address of the user
 *                          wallet:
 *                              type: string
 *                              description: The wallet address of user who get the nft
 *                          ip:
 *                              type: string
 *                              description: The ip address of the user (CHINA ip address banned)
 *                          country_name:
 *                              type: string
 *                              description: The country name of the user
 *                          date:
 *                              type: string
 *                              description: The date of purchase
 *                      example:
 *                          email: "test@gmail.com"
 *                          wallet: "0xBbF1abFA6a5Cee3103f6ea44341c014631A11AF7"
 *                          ip: "1.1.1.1"
 *                          country_name: "china"
 *                          date: "2021-12-19T15:20:54.000Z"
 *      responses:
 *           200:
 *              description: The item was Successfuly created.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: "61bf9a75fce72f233a5410be"
 *           500:
 *              description: The item creation failed.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *                          example: 'Server Error'
 */

router.post('/create', MiddlewareAuth, async(request, response) => {
    create(request, response);
});
router.post('/update', async(request, response) => {
    update(request, response);
});
module.exports = router;