const bs58 = require('bs58');

const getMultihashFromBytes32 = mhashObj => {
    const { digest, hashFunction, size } = mhashObj;
    if (size === 0) return null;
    const hashBytes = Buffer.from(digest.slice(2), 'hex');
    const multihashBytes = new hashBytes.constructor(2 + hashBytes.length);
    multihashBytes[0] = hashFunction;
    multihashBytes[1] = size;
    multihashBytes.set(hashBytes, 2);
    return bs58.encode(multihashBytes);
};

module.exports = getMultihashFromBytes32;