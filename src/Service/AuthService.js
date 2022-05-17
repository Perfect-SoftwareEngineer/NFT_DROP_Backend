const ethUtil = require('ethereumjs-util');
const sigUtil = require('eth-sig-util');

const verifySignature = (Nonce, wallet, signature) => {
    const msg = `Luna Backend user one-time Nonce: ${Nonce}`;

    const msgBufferHex = ethUtil.bufferToHex(Buffer.from(msg, 'utf8'));
    const address = sigUtil.recoverPersonalSignature({
        data: msgBufferHex,
        sig: signature
    });

    if (address.toLowerCase() === wallet.toLowerCase()) {
        return true;
    } else {
        return false;
    }
}

  
module.exports = {
    verifySignature
}
