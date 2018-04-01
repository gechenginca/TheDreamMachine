const crypto = require('crypto');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cookie = require('cookie');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser') 

const app = express();
app.use(cookieParser());
ExpressPeerServer = require('peer').ExpressPeerServer;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: crypto.randomBytes(64).toString('base64'),
    resave: false,
    saveUninitialized: true,
    // cookie: { httpOnly: true, secure: true, sameSite: true } TODO
}));

// Session has username.
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
const PORT = process.env.PORT || 3000;

const socketIo = require('socket.io'); //(server)

let tableId;
let line_history = [];

app.use('/peer', ExpressPeerServer(server, {}));

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
        if (!req.username) return res.status(401).end("access denied, please login");
        next();
    };

    // curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice","yearOfStudy":"3","program":"cs","currentCourses":["cSCC09", "CSCC01"],"finishedCourses":["CSCC01", "CSCB09"],"school":"uoft"}' -c cookie.txt localhost:3000/signup/
    app.post('/signup/', function(req, res, next) {
        if (!('username' in req.body)) return res.status(400).end('username is missing');
        if (!('password' in req.body)) return res.status(400).end('password is missing');
        // TODO created a seperation in databases between user password pair and profile
        // Need to create row in profile database in future.
        let username = req.body.username;
        let password = req.body.password;
        let salt = generateSalt();
        User.findOne({ _id: username }, function(err, user) {
            if (err) return res.status(500).end(err);
            if (user) return res.status(409).end("username " + username + " already exists");
            let salt = generateSalt();
            let hash = generateHash(password, salt);
            // create new user
            let newUser = new User({_id: username, hash: hash, salt: salt});
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
        let username = req.body.username;
        let password = req.body.password;
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
        let usernames = [];
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

    /*
    app.get('/api/users/:username/', is_Authenticated, function(req, res, next) {
        User.findOne({ _id: req.params.username }, function(err, user) {
            if (err) return res.status(500).end(err);
            if (user == null) return res.status(404).end('user ' + req.params.username + ' does not exist');
            else {
                return res.json(user);
            }
        });
    });
    */

    

    // Example for updating profile TODO
    // curl -H "Content-Type: application/json" -X PATCH -d '{"yearOfStudy":"3","program":"cs","currentCourses":["cSCC09", "CSCC01"],"finishedCourses":["CSCC01", "CSCB09"],"school":"uoft"}' -b cookie.txt localhost:3000/api/users/alice

    // update an user's password
    app.patch('/signup/', is_Authenticated, function(req, res, next) {
        if (req.session.username != req.body.username) return res.status(401).end('access denied, you are not the owner');
        //User.findOneAndUpdate({ _id: req.params.username }, {yearOfStudy: req.body.yearOfStudy, program: req.body.program, currentCourses: req.body.currentCourses, finishedCourses: req.body.finishedCourses, school: req.body.school}, {new: true}, function(err, user) {

        let username = req.session.username;
        let password = req.body.password;
        let salt = generateSalt();

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
    // TODO set owner
    // curl -H "Content-Type: application/json" -X POST -d '{"studyTableName":"C09","owner":"alice", "course":"C09","location":"uoft","type":"discussion","priOrPub":"public","description":"c09 awesome","members":["alice"],"meetingTimes":["Friday"],"meetingTopics":["c09 project"]}' -b cookie.txt localhost:3000/api/studyTables/
    app.post('/api/studyTables/', is_Authenticated, function(req, res, next) {
        let studyTableName = req.body.studyTableName;
        StudyTable.findOne({ _id: studyTableName }, function(err, studyTable) {
            if (err) return res.status(500).end(err);
            if (studyTable) return res.status(409).end("study table " + studyTableName + " already exists");
            // set owner to session username  
            let newStudyTable = new StudyTable({
                    _id: studyTableName, 
                    owner: req.session.username, 
                    course: req.body.course, 
                    location: req.body.location, 
                    type: req.body.type, 
                    priOrPub: req.body.priOrPub, 
                    description: req.body.description, 
                    members: req.body.members, 
                    meetingTimes: req.body.meetingTimes, 
                    meetingTopics: req.body.meetingTopics
                    });

            // save new study table todb
            newStudyTable.save(function(err, newStudyTable) {
                if (err)
                {
                    console.error(err);
                    return res.status(500).end(err);
                }
                return res.json(newStudyTable);
            });
        });
    });

    // get all study tables ids
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
            }
            return res.json(studyTables);

        });
    });

    // get a study table object
    // curl -b cookie.txt localhost:3000/api/studyTables/C09
    app.get('/api/studyTables/:studyTableName/', is_Authenticated, function(req, res, next) {
        StudyTable.findOne({ _id: req.params.studyTableName }, function(err, studyTable) {
            if (err) return res.status(500).end(err);
            if (studyTable == null) return res.status(404).end('study table ' + req.params.studyTableName + ' does not exist');
            return res.json(studyTable);
        });
    });

    // update a study table
    // Must be the owner, match session id
    // curl -H "Content-Type: application/json" -X PATCH -d '{"course":"C09","location":"uoft","type":"discussion","priOrPub":"public","description":"c09 awesome","members":["alice"],"meetingTimes":["Friday 1-3pm"],"meetingTopics":["c09 project"]}' -b cookie.txt localhost:3000/api/studyTables/C09
    app.patch('/api/studyTables/:studyTableName/', is_Authenticated, function(req, res, next) {
        StudyTable.findOne({ _id: req.params.studyTableName }, function(err, studyTable) {
            if (err) return res.status(500).end(err);
            if (studyTable == null) return res.status(404).end('study table ' + req.params.studyTableName + ' does not exist');
            if (studyTable.owner != req.session.username) return res.status(401).end('access denied, you are not the owner');

            let updatedStudyTable = studyTable;
            //studyTable.set({course: req.body.course, location: req.body.location, type: req.body.type, priOrPub: req.body.priOrPub, description: req.body.description, members: req.body.members, meetingTimes: req.body.meetingTimes, meetingTopics: req.body.meetingTopics});

            // Cannot update owner, yet TODO
            updatedStudyTable.course = req.body.course;
            updatedStudyTable.location = req.body.location;
            updatedStudyTable.type = req.body.type;
            updatedStudyTable.priOrPub = req.body.priOrPub;
            updatedStudyTable.description = req.body.description;
            updatedStudyTable.members = req.body.members;
            updatedStudyTable.meetingTimes = req.body.meetingTimes;
            updatedStudyTable.meetingTopics = req.body.meetingTopics;

            studyTable.save(function(err, updatedStudyTable) {
                if (err) return console.error(err);
                return res.json(updatedStudyTable);
            });
        });
    });

    // Remove a study table
    // curl -b cookie.txt -X DELETE localhost:3000/api/studyTables/C09
    app.delete('/api/studyTables/:studyTableName/', is_Authenticated, function(req, res, next) {
        StudyTable.findOne({ _id: req.params.studyTableName }, function(err, studyTable) {
            if (err) return res.status(500).end(err);
            if (studyTable == null) return res.status(404).end('study table ' + req.params.studyTableName + ' does not exist');
            if (studyTable.owner != req.session.username) return res.status(401).end('access denied, you are not the owner');
            studyTable.remove(function(err) {
                if (err) return console.error(err);
                return res.json('study table ' + studyTable._id + ' has been removed');
            });
        });
    });

    //TODO
    app.get('/api/canvas/data/', is_Authenticated, function(req, res, next) {
        return res.json(line_history);
        // return res.json(null);
    })


    var activeCanvases = {};
    /*
        key-table_id: line_history
    */

    var activeTablePeers = {};
    /*
        key-table_id: [ids]
    */

    var ids_to_socket = {};

    var activeTableUsers = {};
    /*
        key-token: {table_id: tbl, username: user}
    */
    // Canvas CRUD and socket io

    app.get('/api/canvas/:tableId/', is_Authenticated, function(req, res, next) {
        StudyTable.findOne({ _id: req.params.tableId }, function(err, studyTable) {
            if (err) return res.status(500).end(err);
            if (studyTable == null) return res.status(404).end('study table ' + req.params.tableId + ' does not exist');

            // Set token to use later.
            let table_token = crypto.randomBytes(64).toString('base64');
            res.setHeader('Set-Cookie', cookie.serialize('table_token', table_token, {
                path: '/',
                maxAge: 60 * 60 * 24
            }));
            
            let activeTableUser = {table_id: req.params.tableId, username: req.session.username};
            activeTableUsers[table_token] = activeTableUser;

            //OLD TODO remove
            saveTableId(req.params.tableId);

            Canvas.findOne({ tableId: req.params.tableId }, function(err, existedCanvas) {
                if (err) return res.status(500).end(err);
                if (existedCanvas == null) {
                    const newCanvas = new Canvas({tableId: req.params.tableId, data: []});
                    newCanvas.save(function(err, newCanvas) {
                        if (err) return console.error(err);
                    });
                } else {

                    activeCanvases[req.params.tableId] = existedCanvas.data;
                    // OLD TODO remove
                    setLineHistory(existedCanvas.data);

                    //res.redirect('/studyTable.html');
                }
                res.json(table_token);
            });
        });
    });

    app.patch('/api/saveCanvas/', is_Authenticated, function(req, res, next) {
        console.log(req.cookies);
        let table_tok = req.cookies.table_token;

        let active_t = activeTableUsers[table_tok];
        if (active_t == null || active_t == undefined)
        {
            return res.status(400).end("No table token");
        }

        let my_table_id = active_t.table_id;
        
        Canvas.findOne({ tableId: my_table_id }, function(err, canvas) {
            if (err) return console.error(err);
            if (canvas == null) return res.status(400).end('canvas under table id ' + tableId + ' does not exist');
            activeCanvases[my_table_id] = req.body.line_history;
            setLineHistory(req.body.line_history);
            canvas.data = req.body.line_history;
            canvas.save(function(err, updatedCanvas) {
                if (err) return res.status(400).end(err);
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

    //var ids = [];
    io.on('connection', function(socket) {

        // Need to check if authenticated (Cannot easily do that)
        // Need to check if table id matches with token, does token exists
        // Set table id

        let table_tok = cookie.parse(socket.handshake.headers.cookie).table_token;

        let active_t = activeTableUsers[table_tok];
        if (active_t == null || active_t == undefined)
        {
            socket.disconnect(0);
            return;
        }
        else
        {

        let my_table_id = active_t.table_id;
        let my_user = active_t.username;
        //console.log("I am " + my_user + " connected to table " + my_table_id);
        socket.join(my_table_id);
        
        // console.log('client connected');
/*----------------------------webRTC Begin---------------------------------------*/
        socket.on('clientid', function(id) {
            //activeTablePeers[table_id].push(id);
            let ids = activeTablePeers[my_table_id];
            if (ids == null || ids == undefined)
            {
                ids =[];
            }
            ids.push(id);
            activeTablePeers[my_table_id] = ids;

            /*
            ids_to_socket[id] = socket;
            console.log();
            */
            //console.log("I am " + my_user + " connected to table " + my_table_id + "Getting peer ids: " + ids);
            /*
            let c_sock = 0;
            for (c_sock = 0; c_sock < ids.length; c_sock++)
            {
                ids_to_socket[ids[c_sock]].emit('clientid', ids);
            }
            */
            

            //socket.broadcast.emit('clientid', ids);
            socket.to(my_table_id).emit('clientid', ids);
        })
/*----------------------------webRTC End---------------------------------------*/

        // for (let i in line_history) {
        //     socket.emit('draw_line', { line: line_history[i] });
        // }

        // socket.on('draw_line', function(data) {
        //     line_history.push(data.line);
        //     io.emit('draw_line', { line: data.line });
        // });

        // socket.on('clear', function(data) {
        //     line_history = [];
        //     io.emit('clear', {});
        // });
        }
    });

});




