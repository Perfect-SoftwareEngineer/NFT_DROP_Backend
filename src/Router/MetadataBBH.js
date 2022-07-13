var express = require('express');
var router = express.Router();
var {get, changeName} = require('../Controller/MetadataBBHController');
var MiddlewareAuth = require('../Middleware/MiddlewareAuth')


/**
 * @swagger
 * components: 
 *  schemas:
 *      MetadataBB:
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
 * /api/metadata/basketballhead/get/{tokenId}:
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
 *                 $ref: '#/components/schemas/MetadataBB'
 */
router.get('/get/:tokenId', async(request, response) => {
    get(request, response);
});

router.post('/change_name', MiddlewareAuth, async(request, response) => {
    changeName(request, response);
});


module.exports = router;