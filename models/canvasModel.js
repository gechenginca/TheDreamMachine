const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let canvasModel = new Schema({
    tableId: { type: String },
    data: { type: Object }
});

module.exports = mongoose.model('Canvas', canvasModel);