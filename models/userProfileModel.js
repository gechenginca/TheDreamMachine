const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userModel = new Schema({
    _id: { type: String },
    name: { type: String },
    yearOfStudy: { type: String },
    program: { type: String },
    currentCourses: { type: String },
    finishedCourses: { type: String },
    school: { type: String }
});

module.exports = mongoose.model('User', userModel);
