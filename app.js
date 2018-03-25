const crypto = require('crypto');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cookie = require('cookie');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: crypto.randomBytes(64).toString('base64'),
    resave: false,
    saveUninitialized: true,
    // cookie: { httpOnly: true, secure: true, sameSite: true }
}));

app.use(function(req, res, next) {
    req.username = (req.session.username) ? req.session.username : null;
    // res.setHeader('Set-Cookie', cookie.serialize('username', req.username, {
    //       path : '/',
    //       maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
    //       httpOnly: false,
    //       secure: true,
    //       sameSite: true
    // }));
    next();
});

app.use(express.static('frontend'));

const server = require('http').createServer(app);
let PORT = process.env.PORT || 3000;
const socketIo = require('socket.io');
let tableId;
let line_history = [];

const io = socketIo.listen(server);
server.listen(PORT, function(err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});

// let db = mongoose.connect('mongodb://localhost/user');
// let db = mongoose.connect('mongodb+srv://c09project:tdm0322@cluster0-obj3a.mongodb.net/test');
let db = mongoose.connect('mongodb://admin:thedreammachine@ds115569.mlab.com:15569/studytable');
let connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function() {
    console.log('Successfully connected to database');

    const generateSalt = function() {
        return crypto.randomBytes(16).toString('base64');
    };

    const generateHash = function(password, salt) {
        const hash = crypto.createHmac('sha512', salt);
        hash.update(password);
        return hash.digest('base64');
    };

    //Databases:
    let User = require('./models/userModel.js');
    let StudyTable = require('./models/studyTableModel.js');
    let Canvas = require('./models/canvasModel.js');

    const is_Authenticated = function(req, res, next) {
        if (!req.username) return res.status(401).end('access denied, please login');
        next();
    };

    // curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice","yearOfStudy":"3","program":"cs","currentCourses":["cSCC09", "CSCC01"],"finishedCourses":["CSCC01", "CSCB09"],"school":"uoft"}' -c cookie.txt localhost:3000/signup/
    app.post('/signup/', function(req, res, next) {
        if (!('username' in req.body)) return res.status(400).end('username is missing');
        if (!('password' in req.body)) return res.status(400).end('password is missing');
        // TODO created a seperation in databases between user password pair and profile
        // Need to create row in profile database in future.
        const username = req.body.username;
        const password = req.body.password;
        const salt = generateSalt();
        User.findOne({ _id: username }, function(err, user) {
            if (err) return res.status(500).end(err);
            if (user) return res.status(409).end("username " + username + " already exists");
            const salt = generateSalt();
            const hash = generateHash(password, salt);
            // create new user
            const newUser = new User({_id: username, hash: hash, salt: salt});
            // save new user
            newUser.save(function (err, newUser) {
                if (err) return console.error(err);
                // initialize cookie
                res.setHeader('Set-Cookie', cookie.serialize('username', username, {
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7
                }));
                // Set as logged in
                req.session.username = username;
                return res.json("user " + username + " signed up");
            });
        });
    });

    // curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signin/
    app.post('/signin/', function(req, res, next) {
        if (!('username' in req.body)) return res.status(400).end('username is missing');
        if (!('password' in req.body)) return res.status(400).end('password is missing');
        const username = req.body.username;
        const password = req.body.password;
        // retrieve user from the database
        User.findOne({ _id: username }, function(err, user) {
            if (err) return res.status(500).end(err);
            if (!user) return res.status(401).end("access denied");
            if (user.hash !== generateHash(password, user.salt)) return res.status(401).end("wrong user name or password, access denied");
            // initialize cookie
            res.setHeader('Set-Cookie', cookie.serialize('username', username, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7
            }));
            req.session.username = username;
            console.log("Loged in as: "+req.session.username);
            return res.json("user " + username + " signed in");
        });
    });

    // curl -b cookie.txt -c cookie.txt localhost:3000/signout/
    app.get('/signout/', function(req, res, next) {
        res.setHeader('Set-Cookie', cookie.serialize('username', '', {
            path: '/',
            maxAge: 60 * 60 * 24 * 7
        }));
        req.session.username = null;
        req.session.destroy();
        //res.redirect('/');
        return res.json("");
    });

    // user CRUD

    // get all usernames
    // curl -b cookie.txt localhost:3000/api/users/
    app.get('/api/users/', is_Authenticated, function(req, res, next) {
        const usernames = [];
        User.find({}).sort({ createdAt: 1 }).exec(function(err, allUsers) {
            if (err) return res.status(500).end(err);
            if (allUsers != null) {
                for (let i = 0; i < allUsers.length; i++) {
                    usernames.push(allUsers[i]._id);
                }
                return res.json(usernames);
            }
        });
    });

    //TODO should not be returning hash or salt, should be returning profile info ONLY!
    // get an user
    // curl -b cookie.txt localhost:3000/api/users/alice
    app.get('/api/users/:username/', is_Authenticated, function(req, res, next) {
        User.findOne({ _id: req.params.username }, function(err, user) {
            if (err) return res.status(500).end(err);
            if (user == null) return res.status(404).end('user ' + req.params.username + ' does not exist');
            else {
                return res.json(user);
            }
        });
    });

    // update an user's password

    // Example for updating profile TODO
    // curl -H "Content-Type: application/json" -X PATCH -d '{"yearOfStudy":"3","program":"cs","currentCourses":["cSCC09", "CSCC01"],"finishedCourses":["CSCC01", "CSCB09"],"school":"uoft"}' -b cookie.txt localhost:3000/api/users/alice
    app.patch('/signup/', is_Authenticated, function(req, res, next) {
        if (req.session.username != req.body.username) return res.status(401).end('access denied, you are not the owner');
        //User.findOneAndUpdate({ _id: req.params.username }, {yearOfStudy: req.body.yearOfStudy, program: req.body.program, currentCourses: req.body.currentCourses, finishedCourses: req.body.finishedCourses, school: req.body.school}, {new: true}, function(err, user) {

        const username = req.session.username;
        const password = req.body.password;
        const salt = generateSalt();

        User.findOneAndUpdate({ _id: username }, {hash: hash, salt: salt}, {new: true}, function(err, user) {
            if (err) return res.status(500).end(err);
            if (user == null) return res.status(404).end('user ' + username + ' does not exist');
            else {
                return res.json("user " + username + " password updated.");
                //return res.json(user);
            }
        });
    });

    // study table CRUD

    // add a study table
    // curl -H "Content-Type: application/json" -X POST -d '{"studyTableName":"C09","owner":"alice", "course":"C09","location":"uoft","type":"discussion","priOrPub":"public","description":"c09 awesome","members":["alice"],"meetingTimes":["Friday"],"meetingTopics":["c09 project"]}' -b cookie.txt localhost:3000/api/studyTables/
    app.post('/api/studyTables/', is_Authenticated, function(req, res, next) {
        const studyTableName = req.body.studyTableName;
        StudyTable.findOne({ _id: studyTableName }, function(err, studyTable) {
            if (err) return res.status(500).end(err);
            if (studyTable) return res.status(409).end("study table " + studyTableName + " already exists");
            // check if owner exists
            User.findOne({ _id: req.body.owner }, function(err, user) {
                if (err) return res.status(500).end(err);
                // if (user == null) return res.status(404).end('user ' + req.params.owner + ' does not exist, failed to create this study table');
                // create new study table
                const newStudyTable = new StudyTable({_id: studyTableName, owner: req.username, course: req.body.course, location: req.body.location, type: req.body.type, priOrPub: req.body.priOrPub, description: req.body.description, members: req.body.members, meetingTimes: req.body.meetingTimes, meetingTopics: req.body.meetingTopics});
                // save new study table
                newStudyTable.save(function(err, newStudyTable) {
                    if (err) return console.error(err);
                    return res.json(newStudyTable);
                });
            });
        });
    });

    // get all study tables
    // curl -b cookie.txt localhost:3000/api/studyTables/
    // app.get('/api/studyTables/', is_Authenticated, function(req, res, next) {
    app.get('/api/studyTables/', is_Authenticated, function(req, res, next) {
        const studyTables = [];
        StudyTable.find({}).sort({ createdAt: 1 }).exec(function(err, allStudyTables) {
            if (err) return res.status(500).end(err);
            if (allStudyTables != null) {
                for (let i = 0; i < allStudyTables.length; i++) {
                    studyTables.push(allStudyTables[i]._id);
                }
                return res.json(studyTables);
            }
        });
    });

    // get a study table
    // curl -b cookie.txt localhost:3000/api/studyTables/C09
    app.get('/api/studyTables/:studyTableName/', is_Authenticated, function(req, res, next) {
        StudyTable.findOne({ _id: req.params.studyTableName }, function(err, studyTable) {
            if (err) return res.status(500).end(err);
            if (studyTable == null) return res.status(404).end('study table ' + req.params.studyTableName + ' does not exist');
            return res.json(studyTable);
        });
    });

    // update a study table
    // curl -H "Content-Type: application/json" -X PATCH -d '{"course":"C09","location":"uoft","type":"discussion","priOrPub":"public","description":"c09 awesome","members":["alice"],"meetingTimes":["Friday 1-3pm"],"meetingTopics":["c09 project"]}' -b cookie.txt localhost:3000/api/studyTables/C09
    app.patch('/api/studyTables/:studyTableName/', is_Authenticated, function(req, res, next) {
        StudyTable.findOne({ _id: req.params.studyTableName }, function(err, studyTable) {
            if (err) return res.status(500).end(err);
            if (studyTable == null) return res.status(404).end('study table ' + req.params.studyTableName + ' does not exist');
            if (studyTable.owner != req.username) return res.status(401).end('access denied, you are not the owner');
            studyTable.set({course: req.body.course, location: req.body.location, type: req.body.type, priOrPub: req.body.priOrPub, description: req.body.description, members: req.body.members, meetingTimes: req.body.meetingTimes, meetingTopics: req.body.meetingTopics});
            studyTable.save(function(err, updatedStudyTable) {
                if (err) return console.error(err);
                return res.json(updatedStudyTable);
            });
        });
    });

    // remove a study table
    // curl -b cookie.txt -X DELETE localhost:3000/api/studyTables/C09
    app.delete('/api/studyTables/:studyTableName/', is_Authenticated, function(req, res, next) {
        StudyTable.findOne({ _id: req.params.studyTableName }, function(err, studyTable) {
            if (err) return res.status(500).end(err);
            if (studyTable == null) return res.status(404).end('study table ' + req.params.studyTableName + ' does not exist');
            if (studyTable.owner != req.username) return res.status(401).end('access denied, you are not the owner');
            studyTable.remove(function(err) {
                if (err) return console.error(err);
                return res.json('study table ' + studyTable._id + ' has removed');
            });
        });
    });

    app.get('/api/canvas/:tableId/', is_Authenticated, function(req, res, next) {
        StudyTable.findOne({ _id: req.params.tableId }, function(err, studyTable) {
            if (err) return res.status(500).end(err);
            if (studyTable == null) return res.status(404).end('study table ' + req.params.tableId + ' does not exist');
            saveTableId(req.params.tableId);
            Canvas.findOne({ tableId: req.params.tableId }, function(err, existedCanvas) {
                if (err) return res.status(500).end(err);
                if (existedCanvas == null) {
                    const newCanvas = new Canvas({tableId: req.params.tableId, data: []});
                    newCanvas.save(function(err, newCanvas) {
                        if (err) return console.error(err);
                    });
                } else {
                    setLineHistory(existedCanvas.data);
                    res.redirect('/studyTable.html');
                }
            });
        });
    });

    app.get('/api/saveCanvas/', is_Authenticated, function(req, res, next) {
        Canvas.findOne({ tableId: tableId }, function(err, canvas) {
            if (err) return console.error(err);
            if (canvas == null) return console.error('canvas under table id ' + tableId + ' does not exist');
            canvas.data = line_history;
            canvas.save(function(err, updatedCanvas) {
                if (err) return console.error(err);
            });
            return res.json("");
        });
    });

    function saveTableId(id) {
        tableId = id;
    }

    function setLineHistory(data) {
        line_history = data;
    }

    io.on('connection', function(socket) {
        console.log('client connected');

/*----------------------------webRTC Begin---------------------------------------*/
        socket.on('join', function(room){
            var clients = io.sockets.adapter.rooms[room];
            var numClients = (typeof clients !== 'undefined') ? clients.length : 0;
            if (numClients == 0){
                socket.join(room);
                socket.emit('join', room);
            }
            else if (numClients == 1) {
                socket.join(room);
                socket.emit('join', room);
                socket.emit('ready', room);
                socket.broadcast.emit('ready', room);
            }
            else {
                socket.emit('full', room);
            }
        });

        socket.on('candidate', function(candidate){
            socket.broadcast.emit('candidate', candidate);
        });

        socket.on('offer', function(offer){
            socket.broadcast.emit('offer', offer);
        });

        socket.on('answer', function(answer){
            console.log('relaying answer');
            socket.broadcast.emit('answer', answer);
        });

        socket.on('disconnect', function() {
            console.log('client disconnected');
        });
/*----------------------------webRTC End---------------------------------------*/

        for (let i in line_history) {
            socket.emit('draw_line', { line: line_history[i] });
        }

        socket.on('draw_line', function(data) {
            line_history.push(data.line);
            io.emit('draw_line', { line: data.line });
        });

        socket.on('clear', function(data) {
            line_history = [];
            io.emit('clear', {});
        });
    });

});




