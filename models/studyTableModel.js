const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let studyTableModel = new Schema({
    _id: { type: String },
    owner: { type: String },
    course: { type: String },
    location: { type: String },
    type: { type: String },
    priOrPub: { type: String },
    description: { type: String },
    members: { type: String },
    meetingTimes: { type: String },
    meetingTopics: { type: String }
});

module.exports = mongoose.model('StudyTable', studyTableModel);