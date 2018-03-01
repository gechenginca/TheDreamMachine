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
        user object:
            - (String) _id
            - (String) hash
            - (String) salt
            - (String) yearOfStudy
            - (String) program
            - (String) currentCourses
            - (String) finishedCourses
            - (String) school

        user object:
            - (String) _id
            - (String) course
            - (String) location
            - (String) type
            - (String) priOrPub
            - (String) description
            - (String) members
            - (String) meetingTimes
            - (String) meetingTopics
    ****************************** */

    module.getCurrentUser = function(){
        var username = document.cookie.split("username=")[1];
        if (username.length == 0) return null;
        return username;
    };

    // userProfile is a json object includes username, password, yearOfStudy, program, currentCourses, finishedCourses, school
    module.signup = function(userProfile, callback) {
        send("POST", "/signup/", userProfile, callback);
    };

    module.signin = function(username, password, callback) {
        send("POST", "/signin/", { username: username, password: password }, callback);
    };

    module.getUsernames = function(callback) {
        send("GET", "/api/users/", null, callback);
    };

    module.getUser = function(username, callback) {
        send("GET", "/api/users/" + username + "/", null, callback);
    };

    // updates is a json object includes yearOfStudy, program, currentCourses, finishedCourses, school
    module.updateUser = function(username, updates, callback) {
        send("PATCH", "/api/users/" + username + "/", updates, callback);
    };

    // tableProfile contains studyTableName, course, location, type, priOrPub, description, members, meetingTimes, meetingTopics
    module.addStudyTable = function(tableProfile, callback) {
        send("POST", "/api/studyTables/", tableProfile, callback);
    };

    module.getStudyTables = function(callback) {
        send("GET", "/api/studyTables/", null, callback);
    };

    module.getStudyTable = function(studyTableName, callback) {
        send("GET", "/api/studyTables/" + studyTableName + "/", null, callback);
    };

    // updates is a json object contains course, location, type, priOrPub, description, members, meetingTimes, meetingTopics
    module.updateStudyTable = function(studyTableName, updates, callback) {
        send("PATCH", "/api/StudyTables/" + studyTableName + "/", updates, callback);
    };

    // delete a study table
    module.deleteComment = function(commentId, callback) {
        send("DELETE", "/api/StudyTables/" + studyTableName + "/", null, callback);
    };

    return module;
})();