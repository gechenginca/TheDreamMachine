var api = (function() {
    var module = {};

    function sendFiles(method, url, data, callback) {
        var formdata = new FormData();
        Object.keys(data).forEach(function(key) {
            var value = data[key];
            formdata.append(key, value);
        });
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        xhr.send(formdata);
    }

    function send(method, url, data, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        if (!data) xhr.send();
        else {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    }

    /*  ******* Data types *******
        
        auth object:
            - (String) username
            - (String) password
        
        user object:
            - (String) _id
            - (String) name
            - (String) yearOfStudy
            - (String) program
            - (String) currentCourses
            - (String) finishedCourses
            - (String) school

        table object:
            - (String) _id
            - (String) owner
            - (String) course
            - (String) location
            - (String) isVirtual
            - (String) isPublic
            - (String) description
            - (String) members
            - (String) meetingTimes
            - (String) meetingTopics
    ****************************** */

    // Get user from cookies. 
    module.getCurrentUser = function(){
        var username = document.cookie.split("username=")[1];
        if (username.length == 0) return null;
        return username;
    };

    module.signup = function(auth, callback) {
        send("POST", "/signup/",
            auth, 
            callback);
        
    };
    
    // Sign in, sets user session
    module.signin = function(username, password, callback) {
        send("POST", "/signin/", { username: username, password: password }, callback);
    };
    module.signin2 = function(auth, callback) {
        send("POST", "/signin/", auth, callback);
    };

    // TODO do we need this?
    module.getUsernames = function(callback) {
        send("GET", "/api/users/", null, callback);
    };

    // Get user metadata
    module.getUser = function(username, callback) {
        send("GET", "/api/users/" + username + "/", null, callback);
    };

    // updates is a json object includes yearOfStudy, program, currentCourses, finishedCourses, school
    /* TODO
    module.updateUser = function(username, UserProfile, callback) {
        send("PATCH", "/api/users/" + username + "/", UserProfile, callback);
    };
    */
    // Update password for user TODO should it be post?
    module.updatePass = function(username, auth, callback) {
        send("PATCH", "/api/users/" + username + "/", auth, callback);
    };

    // tableProfile potencially contains studyTableName, course, location, type, priOrPub, description, members, meetingTimes, meetingTopics
    module.addStudyTable = function(tableProfile, callback) {
        send("POST", "/api/studyTables/", tableProfile, callback);
    };

    //TODO add offset, (have buttons for next and previous find)

    // Get ALL (TODO maybe dangerous)
    module.getStudyTables = function(callback) {
        send("GET", "/api/studyTables/", null, callback);
    };

    //TODO get tables by course id

    //TODO get tables by table name

    // Get study table metadata
    // Also sets token/cookie table id
    module.getStudyTable = function(studyTableId, callback) {
        send("GET", "/api/studyTables/" + studyTableId + "/", null, callback);
    };

    // update metadata
    // updates is a json object contains course, location, type, priOrPub, description, members, meetingTimes, meetingTopics
    module.updateStudyTable = function(studyTableName, updates, callback) {
        send("PATCH", "/api/StudyTables/" + studyTableName + "/", updates, callback);
    };

    // delete a study table
    module.deleteStudyTable = function(studyTableName, callback) {
        send("DELETE", "/api/StudyTables/" + studyTableName + "/", null, callback);
    };

    // Use user session AND group token/cookie
    // TODO get group (active?)members

    // TODO get group chat

    // TODO post to group chat


    return module;
})();
