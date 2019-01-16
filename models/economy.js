const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const economySchema = new Schema({
    address: { type: String, required: true },
    JSON: { type: Object, required: true },
});

module.exports = mongoose.model('Economy', economySchema);
