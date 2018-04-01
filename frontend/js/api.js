var api = (function() {
    var module = {};

    // Standart AJAX sent requests.

    /*
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
    */

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
        let cookies = document.cookie.split(";");
        let username = "";
        let i = 0;
        for (i = 0; i < cookies.length; i++)
        {
            cookies[i] = cookies[i].trim();
            if (cookies[i].startsWith("username="))
            {
                username = cookies[i].split("username=")[1];
            }
        
        }
        
        
        if (username == undefined) return null;
        if (username.length == 0) return null;
        return username;
    };

    // Signup
    // Only use username and pass
    module.signup = function(auth, callback) {
        send("POST", "/signup/",
            auth, 
            callback);
        
    };
    
    // Sign in
    // Sets user session and username in cookies
    module.signin = function(username, password, callback) {
        send("POST", "/signin/", { username: username, password: password }, callback);
    };
    module.signin2 = function(auth, callback) {
        send("POST", "/signin/", auth, callback);
    };

    // Sign out, reset session and remove user cookie
    module.signout = function(callback) {
        send("GET", "/signout/", null, callback);
    };

    // TODO do we need this?
    /*
    module.getUsernames = function(callback) {
        send("GET", "/api/users/", null, callback);
    };
    */

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

    // Update password for user
    module.updatePass = function(auth, callback) {
        send("PATCH", "/signup/", auth, callback);
    };

    // Add study table
    // tableProfile potencially contains studyTableName, course, location, type, priOrPub, description, members, meetingTimes, meetingTopics
    module.addStudyTable = function(tableProfile, callback) {
        send("POST", "/api/studyTables/", tableProfile, callback);
    };

    //TODO add offset, (have buttons for next and previous find)

    // Get all tables ids
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
    
    // Save canvas data to server
    module.saveCanvas = function(data, callback) {
        send("PATCH", "/api/saveCanvas/", {line_history: data}, callback);
    };
    
    // Retrieve canvas from server
    module.getCanvas = function(callback) {
        send("GET", "/api/canvas/data/", null, callback);
    };

    //Set table cookies token
    module.enterStudyTable = function(table_id, callback)
    {
        send("GET", "/api/canvas/" + table_id + "/", null, callback);

    };


    return module;
})();
