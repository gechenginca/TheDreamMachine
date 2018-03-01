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
    saveUninitialized: true
}));

app.use(function(req, res, next) {
    req.username = (req.session.username) ? req.session.username : null;
    console.log("HTTP request", req.username, req.method, req.url, req.body);
    next();
});

app.use(express.static('frontend'));

let db = mongoose.connect('mongodb://localhost/user');
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

    let User = require('./models/userModel.js');

    const is_Authenticated = function(req, res, next) {
        if (!req.username) return res.status(401).end('access denied, please login');
        next();
    };

    // curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice","yearOfStudy":"3","program":"cs","currentCourses":["cSCC09", "CSCC01"],"finishedCourses":["CSCC01", "CSCB09"],"school":"uoft"}' -c cookie.txt localhost:3000/signup/
    app.post('/signup/', function(req, res, next) {
        if (!('username' in req.body)) return res.status(400).end('username is missing');
        if (!('password' in req.body)) return res.status(400).end('password is missing');
        const username = req.body.username;
        const password = req.body.password;
        User.findOne({ _id: username }, function(err, user) {
            if (err) return res.status(500).end(err);
            if (user) return res.status(409).end("username " + username + " already exists");
            const salt = generateSalt();
            const hash = generateHash(password, salt);
            // create new user
            const newUser = new User({_id: username, hash: hash, salt: salt, yearOfStudy: req.body.yearOfStudy, program: req.body.program, currentCourses: req.body.currentCourses, finishedCourses: req.body.finishedCourses, school: req.body.school});
            // save new user
            newUser.save(function (err, newUser) {
                if (err) return console.error(err);
                // initialize cookie
                res.setHeader('Set-Cookie', cookie.serialize('username', username, {
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7
                }));
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
            return res.json("user " + username + " signed in");
        });
    });

    // curl -b cookie.txt -c cookie.txt localhost:3000/signout/
    app.get('/signout/', function(req, res, next) {
        res.setHeader('Set-Cookie', cookie.serialize('username', '', {
            path: '/',
            maxAge: 60 * 60 * 24 * 7
        }));
        req.username = null;
        req.session.destroy();
        res.redirect('/');
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

    // update an user
    // curl -H "Content-Type: application/json" -X PATCH -d '{"username":"alice","password":"alice","yearOfStudy":"3","program":"cs","currentCourses":["cSCC09", "CSCC01"],"finishedCourses":["CSCC01", "CSCB09"],"school":"uoft"}' -c cookie.txt localhost:3000/signup/
    app.patch('/api/users/:username/', is_Authenticated, function(req, res, next) {
        User.findOneAndUpdate({ _id: req.params.username }, {yearOfStudy: req.body.yearOfStudy, program: req.body.program, currentCourses: req.body.currentCourses, finishedCourses: req.body.finishedCourses, school: req.body.school}, {}, function(err, user) {
            if (err) return res.status(500).end(err);
            if (user == null) return res.status(404).end('user ' + req.params.username + ' does not exist');
            else {
                return res.json(user);
            }
        });
    });

});

const http = require('http');
const PORT = 3000;

http.createServer(app).listen(PORT, function(err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});