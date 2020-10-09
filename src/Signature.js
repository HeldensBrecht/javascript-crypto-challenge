const libsodium = require('libsodium-wrappers');

module.exports = async () => {
    await libsodium.ready;
    let pair = libsodium.crypto_sign_keypair();

    return {
        verifyingKey: pair.publicKey,
        sign: (msg) => {
            return libsodium.crypto_sign(msg, pair.privateKey);
        }
    }
}