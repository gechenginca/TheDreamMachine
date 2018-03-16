const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userModel = new Schema({
    _id: { type: String },
    hash: { type: String },
    salt: { type: String },
});

module.exports = mongoose.model('User', userModel);
