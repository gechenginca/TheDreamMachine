const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userModel = new Schema({
    _id: { type: String },
    hash: { type: String },
    salt: { type: String },
    yearOfStudy: { type: String },
    program: { type: String },
    currentCourses: { type: String },
    finishedCourses: { type: String },
    school: { type: String }
});

module.exports = mongoose.model('User', userModel);