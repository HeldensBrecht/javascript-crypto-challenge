const libsodium = require('libsodium-wrappers');

module.exports = async (key) => {
    if (key === undefined) {
        throw 'no key';
    }

    this.key = key;

    await libsodium.ready;
    this.decrypt = (ciphertext, nonce) => {
        return libsodium.crypto_secretbox_open_easy(ciphertext, nonce, this.key);
    };

    return this;
};