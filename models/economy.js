const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const economySchema = new Schema({
    tokenAddress: { type: String, required: true },
    ipfsHash: {type: String, required: true},
    JSON: { type: Object, required: false },
});

module.exports = mongoose.model('Economy', economySchema);
