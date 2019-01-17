const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const economySchema = new Schema({
    tokenAddress: { type: String, required: true },
    ipfsHash: {type: String, required: true},
    data: { 
        name: {type: String, required: true},
        symbol: {type: String, required: true},
        description: {type: String, required: false},
        services: {type: Array, required: false},
        tags: {type: Array, required: false}
    }
});

module.exports = mongoose.model('Economy', economySchema);
