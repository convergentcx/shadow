const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    publicAddress: {type: String, required: true},
    nonce: {type: Number, required: true, default: Math.floor(Math.random()*1000)}
});

module.exports = mongoose.model('User', userSchema);
