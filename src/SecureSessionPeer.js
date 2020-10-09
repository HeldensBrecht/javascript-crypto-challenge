const libsodium = require('libsodium-wrappers');

module.exports = async (oPeer) => {
    await libsodium.ready;
    let pair = libsodium.crypto_kx_keypair();
    let otherPeer = oPeer;
    let sharedKeyR = undefined;
    let sharedKeyT = undefined;
    let messages = [];

    let obj = {
        publicKey: pair.publicKey,
        generateSharedKeys: (oPeer) => {
            otherPeer = oPeer;
            let keys = libsodium.crypto_kx_client_session_keys(pair.publicKey, pair.privateKey, oPeer.publicKey);
            sharedKeyR = keys.sharedRx;
            sharedKeyT = keys.sharedTx;
        },
        receiveMessage: (message) => {
            messages.push(message);
        },
        encrypt: (msg) => {
            let nonce = libsodium.randombytes_buf(libsodium.crypto_secretbox_NONCEBYTES);
            return {
                nonce: nonce,
                ciphertext: libsodium.crypto_secretbox_easy(msg, nonce, sharedKeyT)
            }
        },
        decrypt: (ciphertext, nonce) => {
            return libsodium.crypto_secretbox_open_easy(ciphertext, nonce, sharedKeyR);
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
    }

    return obj;
}