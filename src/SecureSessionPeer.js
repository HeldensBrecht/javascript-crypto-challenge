const libsodium = require('libsodium-wrappers');
const Decryptor = require('./Decryptor')
const Encryptor = require('./Encryptor')

module.exports = async (oPeer) => {
    await libsodium.ready;
    let pair = libsodium.crypto_kx_keypair();
    let otherPeer = oPeer;
    let sharedKeyR, sharedKeyT, decryptor, encryptor = undefined;
    let messages = [];

    let obj = {
        publicKey: pair.publicKey,
        generateSharedKeys: async (oPeer) => {
            otherPeer = oPeer;
            let keys = libsodium.crypto_kx_client_session_keys(pair.publicKey, pair.privateKey, oPeer.publicKey);
            sharedKeyR = keys.sharedRx;
            sharedKeyT = keys.sharedTx;
            decryptor = await Decryptor(sharedKeyR);
            encryptor = await Encryptor(sharedKeyT);
        },
        receiveMessage: (message) => {
            messages.push(message);
        },
        encrypt: (msg) => {
            return encryptor.encrypt(msg);
        },
        decrypt: (ciphertext, nonce) => {
            return decryptor.decrypt(ciphertext, nonce);
        },
        send: (msg) => {
            otherPeer.receiveMessage(obj.encrypt(msg));
        },
        receive: () => {
            let msg = messages.shift();
            return obj.decrypt(msg.ciphertext, msg.nonce);
        }
    }

    Object.freeze(obj);

    if (otherPeer !== undefined) {
        let keys = libsodium.crypto_kx_server_session_keys(pair.publicKey, pair.privateKey, otherPeer.publicKey);
        sharedKeyR = keys.sharedRx;
        sharedKeyT = keys.sharedTx;
        otherPeer.generateSharedKeys(obj);
        decryptor = await Decryptor(sharedKeyR);
        encryptor = await Encryptor(sharedKeyT);
    }

    return obj;
}