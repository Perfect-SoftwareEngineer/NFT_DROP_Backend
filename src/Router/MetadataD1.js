var express = require('express');
var router = express.Router();
var {get, getAll, create, update} = require('../Controller/MetadataD1Controller');
var MiddlewareAuth = require('../Middleware/MiddlewareAuth')


/**
 * @swagger
 * components: 
 *  schemas:
 *      MetadataD1:
 *          type: object
 *          required:
 *              - name
 *              - description
 *              - image
 *              - external_url
 *              - animation_url
 *              - tokenId
 *              - fee_recipient
 *          properties:
 *              _id: 
 *                  type: string
 *                  description: The id of the metadata
 *              name:
 *                  type: string
 *                  description: The name of nft
 *              description:
 *                  type: string
 *                  description: The descrition of nft
 *              image:
 *                  type: string
 *                  description: The link of nft image
 *              external_url:
 *                  type: string
 *                  description: The link of nft addtional info
 *              animation_url:
 *                  type: string
 *                  description: The link of nft animation video
 *              tokenId:
 *                  type: string
 *                  description: The token id of nft
 *              fee_recipient:
 *                  type: string
 *                  description: The fee receipient of nft (royalty)
 *          example:
 *              _id: "61bf9a75fce72f233a5410be"
 *              name: "Unanimous"
 *              description: "Many are called, few are chosen but only one changed the game for good. 2974 and counting for the greatest 3 point shooter of all time. \n\nBy owning this NFT, you agree to all the terms and conditions under 2974.currybrand.com/legal/nft-ownership-agreement."
 *              uri: http://3.11.202.153:8888/api/metadata/get/1
 *              image: "https://luna-bucket.s3.us-east-2.amazonaws.com/production/UNANIMOUS_FINAL.png"
 *              external_url: "https://2974.currybrand.com"
 *              animation_url: "https://luna-bucket.s3.us-east-2.amazonaws.com/production/UNANIMOUS.mp4"
 *              tokenId: "1"
 *              fee_recipient: "0xBbF1abFA6a5Cee3103f6ea44341c014631A11AF7"
 */

/**
 * @swagger
 * /api/metadata/drop1/getAll:
 *   get:
 *     summary: Returns all metadata for drop1
 *     responses:
 *       200:
 *         description: The list of the metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MetadataD1'
 */
router.get('/getAll', async(request, response) => {
    getAll(request, response);
});

/**
 * @swagger
 * /api/metadata/drop1/get/{tokenId}:
 *   get:
 *     summary: Returns metadata by tokenId for drop1
 *     responses:
 *       200:
 *         description: The metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MetadataD1'
 */
router.get('/get/:tokenId', async(request, response) => {
    get(request, response);
});


/**
 * @swagger
 * /api/metadata/drop1/create:
 *   post:
 *      summary: Create a new metadata
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - name
 *                          - description
 *                          - image
 *                          - externalUrl
 *                          - animationUrl
 *                          - feeRecipient
 *                          - tokenId
 *                      properties:
 *                          name:
 *                              type: string
 *                              description: The name of nft
 *                          description:
 *                              type: string
 *                              description: The descrition of nft
 *                          image:
 *                              type: string
 *                              description: The link of nft image
 *                          externalUrl:
 *                              type: string
 *                              description: The link of nft addtional info
 *                          animationUrl:
 *                              type: string
 *                              description: The link of nft animation video
 *                          tokenId:
 *                              type: string
 *                              description: The token id of nft
 *                          feeRecipient:
 *                              type: string
 *                              description: The fee receipient of nft (royalty)
 *                      example:
 *                          name: "The Lab1"
 *                          description: "Precision is a form of madness allied with the physics of movement solving the improbable equation to the symphony of a ‘swish.’1"
 *                          image: "https://luna-bucket.s3.us-east-2.amazonaws.com/The_Lab1.png"
 *                          externalUrl: "currybrand.com"
 *                          animationUrl: "https://luna-bucket.s3.us-east-2.amazonaws.com/The_Lab1.mp4"
 *                          feeRecipient: "0xBbF1abFA6a5Cee3103f6ea44341c014631A11AF7"
 *                          tokenId : "1"
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

router.post('/create',  async(request, response) => {
    create(request, response);
});
router.post('/update',  async(request, response) => {
    update(request, response);
});
module.exports = router;