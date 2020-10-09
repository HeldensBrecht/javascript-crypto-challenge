const libsodium = require('libsodium-wrappers');

module.exports = async (key) => {
    if (key === undefined) {
        throw 'no key';
    }
    return {
        key: key,
        encrypt: (msg) => {
            let nonce = libsodium.randombytes_buf(libsodium.crypto_secretbox_NONCEBYTES);
            return {
                nonce: nonce,
                ciphertext: libsodium.crypto_secretbox_easy(msg, nonce, key)
            }
        }
    }
}