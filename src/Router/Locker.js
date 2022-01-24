var express = require('express');
var router = express.Router();
var { getNft } = require('../Controller/LockerController');


/**
 * @swagger
 * components: 
 *  schemas:
 *      Item:
 *          type: object
 *          required:
 *              - wallet
 *              - platform
 *              - tokenId
 *              - uri
 *              - quantity
 *          properties:
 *              wallet: 
 *                  type: string
 *                  description: The wallet of the user
 *              platform:
 *                  type: string
 *                  description: The platform name
 *              tokenId:
 *                  type: any
 *                  description: The user's nft token ids
 *              uri:
 *                  type: string
 *                  description: The nft metadata url
 *              quantity:
 *                  type: string
 *                  description: The total quantity of nft of user per each platform
 *          example:
 *              wallet: "0xD6deaE43a2Cb8f9d24Bb0cfFbEf2B66D5A8C13B4"
 *              platfrom: "Drop1Nft"
 *              tokenId: "5"
 *              uri: "https://backend.lunamarket.io/api/metadata/drop1/get/5"
 *              quantity: "1"
 */

/**
 * @swagger
 * /api/locker/get/{wallet}:
 *   get:
 *     summary: Returns item by wallet
 *     parameters:
 *      -   in: path
 *          name: wallet
 *          schema:
 *              type: string
 *          required: true
 *          description: The user's wallet
 *     responses:
 *       200:
 *         description: The list of the item by user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
router.get('/get/:wallet', (request, response) => {
    getNft(request, response)
})

module.exports = router;