const libsodium = require('libsodium-wrappers');

module.exports = async () => {
    await libsodium.ready;

    return {
        verify: (hashedPw, pw) => {
            return libsodium.crypto_pwhash_str_verify(hashedPw, pw);
        }
    };
};