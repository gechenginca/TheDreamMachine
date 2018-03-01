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
    ****************************** */

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



    module.getCurrentUser = function(callback) {
        send("GET", "/currentUser/", null, callback);
    };

    // add an image to the gallery
    module.addImage = function(title, file, callback) {
        sendFiles("POST", "/api/images/", { title: title, picture: file }, callback);
    };

    // delete an image from the gallery given its imageId
    module.deleteImage = function(imageId, callback) {
        send("DELETE", "/api/images/" + imageId + "/", null, callback);
    };

    // get an image from the gallery given its imageId
    module.getImage = function(imageId, callback) {
        send("GET", "/api/images/" + imageId + "/", null, callback);
    };

    // get all imageIds for a given username's gallery (no pagination)
    module.getAllImageIds = function(username, callback) {
        send("GET", "/api/users/" + username + '/', null, callback);
    };

    // add a comment to an image
    module.addComment = function(imageId, content, callback) {
        send("POST", "/api/comments/", { imageId: imageId, content: content }, callback);
    };

    // delete a comment to an image
    module.deleteComment = function(commentId, callback) {
        send("DELETE", "/api/comments/" + commentId + "/", null, callback);
    };

    // get comments (with pagination)
    module.getComments = function(imageId, page, callback) {
        send("GET", "/api/comments/" + imageId + "/?page=" + page, null, callback);
    };

    module.openGallery = function(username, callback) {
        send("POST", "/openGallery/", {username: username}, callback);
    };

    module.getGalleryOwner = function(callback) {
        send("GET", "/getGalleryOwner/", null, callback);
    };

    return module;
})();