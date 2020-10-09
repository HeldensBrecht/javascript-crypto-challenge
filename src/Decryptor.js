const libsodium = require('libsodium-wrappers');

module.exports = async (key) => {
    if (key === undefined) {
        throw 'no key';
    }
    await libsodium.ready;
    return {
        key: key,
        decrypt: (ciphertext, nonce) => {
            return libsodium.crypto_secretbox_open_easy(ciphertext, nonce, key);
        }
    }
};