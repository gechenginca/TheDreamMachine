(function()
{
"use strict";

    window.onload = function()
    {
        // Depending if logged in or not will show correct
        // items. Will also reset divs that were shown by other operations.
        var update_front_page = function()
        {

            var usr_cont = document.getElementById('user_control');
            var signin = document.getElementById('log_in');
            var signup = document.getElementById('sign_up');
            var prof_edit = document.getElementById('profile_edit');
            var gr_add = document.getElementById('group_add');
            var srch_box = document.getElementById('search_box');
            var srch_res = document.getElementById('search_results');

            //All index sections
            var all_div = document.getElementsByClassName("index_section");
            //All message sections
            var all_msg = document.getElementsByClassName("profile_msg");

            //TODO
            var usr = api.getCurrentUser();

            // Make all hidded!
            var i;
            for (i=0; i < all_div.length; i++)
            {
                all_div[i].style.display = 'none';
            }

            // Reset messages.
            var i;
            for (i=0; i < all_msg.length; i++)
            {
                all_msg[i].innerHTML = '';
            }
            // if logged out
            //Show log in
            //Show sign up
            // Nothing else
            if ((usr == null) || (usr == ''))
            {
                signin.style.display = 'block';
                signup.style.display = 'block';
            }
            // if logged in
            //Show control
            // Show WHO is looged in
            //Search by Study Groups
            //Results
            // Hide others
            else
            {
                usr_cont.style.display = 'block';
                document.getElementById("whois").innerHTML = ("Logged in as: " + usr);
                srch_box.style.display = 'block';
                srch_res.style.display = 'block';
            }

            document.querySelector('#tables_button').classList.remove("hidden");
        };

        update_front_page();

        //sign up
        var parent_div = document.getElementById('sign_up');
        var msg_div = parent_div.getElementsByClassName("profile_msg")[0];
        var form_sign_up = parent_div.getElementsByTagName("form")[0];

        form_sign_up.addEventListener('submit', function(e)
        {
            // prevent from refreshing the page on submit
            e.preventDefault();
            var user_name = parent_div.getElementsByClassName("profile_user")[0].value;
            var password = parent_div.getElementsByClassName("profile_pass")[0].value;
            var password2 = parent_div.getElementsByClassName("profile_pass")[1].value;
            // clean form
            form_sign_up.reset();

            if (password == password2)
            {
            //Send info to API
                var auth = {username: user_name, password: password};
                api.signup(auth, function(err, msg)
                {
                    if (err != null)
                    {
                        msg_div.innerHTML = err;
                    }
                    else
                    {
                        console.log(msg);
                        update_front_page();
                        //TODO refresh page, since we are logged in.
                    }

                });
            }
            else
            {
                msg_div.innerHTML = "Passwords do not match.";
            }

        });

        // log in
        var parent_sign_in_div = document.getElementById('log_in');
        var msg_sign_in_div = parent_sign_in_div.getElementsByClassName("profile_msg")[0];
        var form_sign_in = parent_sign_in_div.getElementsByTagName("form")[0];

        form_sign_in.addEventListener('submit', function(e)
        {
            // prevent from refreshing the page on submit
            e.preventDefault();
            var user_name = parent_sign_in_div.getElementsByClassName("profile_user")[0].value;
            var password = parent_sign_in_div.getElementsByClassName("profile_pass")[0].value;
            // clean form
            form_sign_in.reset();

            //Send info to API
            var auth = {username: user_name, password: password};
            api.signin2(auth, function(err, msg)
            {
                if (err != null)
                {
                    msg_sign_in_div.innerHTML = err;
                }
                else
                {
                    update_front_page();
                    console.log(msg);
                    //TODO refresh page, since we are logged in.
                }

            });

        });


        //Control Board:
        //Sign out
        //Show:
            //Create Group div
            //Edit Profile div
        //My groups in search result div ( search by owner)
        //var parent_control_div = document.getElementById('user_control');
        var c_my_groups = document.getElementById('control_my_groups');
        var c_create_group = document.getElementById('control_create_group');
        var c_edit_prof = document.getElementById('control_edit_profile');
        var c_sign_out = document.getElementById('control_sign_out');

        c_sign_out.addEventListener("click", function(e)
        {
            e.preventDefault();
            api.signout(function(err,msg){
                //TODO clear page
                console.log("Signed out");
                update_front_page();
            });

        });

        c_create_group.addEventListener("click", function(e)
        {
            e.preventDefault();
            var gr_add = document.getElementById('group_add');
            if (gr_add.style.display == 'block')
            {
                gr_add.style.display = 'none';
            }
            else
            {
                gr_add.style.display = 'block';
            }

        });

        c_edit_prof.addEventListener("click", function(e)
        {
            e.preventDefault();
            var prof_edit = document.getElementById('profile_edit');
            if (prof_edit.style.display == 'block')
            {
                prof_edit.style.display = 'none';
            }
            else
            {
                prof_edit.style.display = 'block';
            }

        });


        //Change password / Edit Profile
        parent_div = document.getElementById('profile_edit');
        msg_div = parent_div.getElementsByClassName("profile_msg")[0];
        form_sign_up = parent_div.getElementsByTagName("form")[0];

        form_sign_up.addEventListener('submit', function(e)
        {
            // prevent from refreshing the page on submit
            e.preventDefault();
            var user_name = api.getCurrentUser();
            var password = parent_div.getElementsByClassName("profile_pass")[0].value;
            var password2 = parent_div.getElementsByClassName("profile_pass")[1].value;
            // clean form
            form_sign_up.reset();

            if (password == password2)
            {
            //Send info to API
                var auth = {username: user_name, password: password};
                api.updatePass(auth, function(err, msg)
                {
                    if (err != null)
                    {
                        msg_div.innerHTML = err;
                    }
                    else
                    {
                        console.log(msg);
                        update_front_page();
                        //TODO refresh page, since we are logged in.
                    }

                });
            }
            else
            {
                msg_div.innerHTML = "Passwords do not match.";
            }

        });



        // create study group
        // test to make sure the user right now
        var create_table_parent = document.getElementById("group_add");
        var table_profile = create_table_parent.getElementsByClassName("profile_msg")[0];
        var table_form = create_table_parent.getElementsByTagName("form")[0];
        table_form.addEventListener("submit", function(e) {
            e.preventDefault();
            // get the table information
            var group_name = create_table_parent.getElementsByClassName("group_name")[0].value;
            var group_course = create_table_parent.getElementsByClassName("group_course")[0].value;
            var undetermined = "undetermined";
            // cleaning
            table_form.reset();

            // sned API
            var tableProfile = {studyTableName: group_name, course: group_course, location: undetermined, type: undetermined, priOrPub: undetermined, description: undetermined, members: undetermined, meetingTimes: undetermined, meetingTopics: undetermined};
            api.addStudyTable(tableProfile, function(err, message) {
                if (err) {
                    table_profile.innerHTML = err;
                } else {
                    console.log(message);
                    update_front_page();
                }
            });
        });

        // search group
        var search_table_parent = document.getElementById("search_box");
        var search_form = search_table_parent.getElementsByTagName("form")[0];
        search_form.addEventListener("submit", function(e) {
            e.preventDefault();
            // get the table information
            var group_name = search_table_parent.getElementsByClassName("search_content")[0].value;
            search_form.reset();
            console.log(group_name);
            // send api
            api.getStudyTable(group_name, function(err, table) {
                if (err) {
                    document.querySelector('#tables_div').innerHTML = err;
                } else {
                    document.querySelector('#tables_div').innerHTML = "";
                    var element = create_table_form(table);
                    document.querySelector('#tables_div').prepend(element);
                    update_front_page();
                }
            });
        });

        // show all group in form
        document.querySelector('#tables_button').addEventListener("click", function(){
            document.querySelector('#tables_button').classList.add("hidden");
            api.getStudyTables(function(err, tables) {
                if (err) {
                    console.log(err);
                } else {
                    document.querySelector('#tables_div').innerHTML = "";
                    for (var i=0; tables[i] != null; i++) {
                        api.getStudyTable(tables[i], function(err, table) {
                            if (err) {
                                console.log(err);
                            } else {
                                var element = create_table_form(table);
                                document.querySelector('#tables_div').prepend(element);
                            }
                        });
                    }
                }
            });

        });

        // function of create table
        var create_table_form = function(table) {
            var element = document.createElement("div");
            element.className = "table_item";
            element.innerHTML += `
                <div class="table_par">
                    <span class="table_label">Name:</span>
                    <span class="table_name">${table._id}</span>
                </div>
                    <div class="table_par">
                    <span class="table_label">Course:</span>
                    <span class="table_course">${table.course}</span>
                </div>
                    <div class="table_par">
                    <span class="table_label">Times meeting:</span>
                    <div class="table_time">${table.meetingTimes}</div>
                </div>
                    <div class="table_par">
                    <span class="table_label">Location:</span>
                    <span class="table_loc">${table.location}</span>
                </div>
                    <div class="table_controls">
                    <button class="control"><a href="/api/canvas/${table._id}/">Enter</a></button>
                    <button class="control edit_button">Edit</button>
                    <button class="control delete_button">delete</button>
                </div>
            `;
            element.querySelector('.delete_button').addEventListener('click', function(){
                api.deleteStudyTable(table._id, function(err, msg) {
                    if (err) console.log(err);
                    else {
                        element.style.display = 'none';
                    }
                });
            });
            element.querySelector('.edit_button').addEventListener('click', function() {
                document.querySelector('#search_results').style.display = 'none';
                var update_form_parent = document.getElementById("edit_div");
                var edit_form = document.createElement('form');
                edit_form.className = "profile_form";
                edit_form.innerHTML += `
                    <div>please enter update info forllowing: location, type, pri or pub, description, time, and topic</div>
                    <input type="text" class="locattion" placeholder="${table.location}" required></input>
                    <input type="text" class="type" placeholder="${table.type}" required></input>
                    <input type="text" class="priOrPub" placeholder="${table.priOrPub}" required></input>
                    <input type="textarea" class="description" placeholder="${table.description}" required></input>
                    <input type="textarea" class="times" placeholder="${table.meetingTimes}" required></input>
                    <input type="text" class="topic" placeholder="${table.meetingTopics}" required></input>
                    <button type="submit" class="group_update">Apply</button>
                `;
                update_form_parent.prepend(edit_form);
                document.querySelector('#group_edit').style.display = 'block';

                var table_form = update_form_parent.getElementsByTagName("form")[0];
                table_form.addEventListener("submit", function(e) {
                    e.preventDefault();
                    // get the table information
                    var group_course = table.course;
                    var group_locattion = table_form.getElementsByClassName("locattion")[0].value;
                    var group_type = table_form.getElementsByClassName("type")[0].value;
                    var group_priOrPub = table_form.getElementsByClassName("priOrPub")[0].value;
                    var group_description = table_form.getElementsByClassName("description")[0].value;
                    var group_time = table_form.getElementsByClassName("times")[0].value;
                    var group_topic = table_form.getElementsByClassName("topic")[0].value;
                    // cleaning
                    table_form.reset();

                    // sned API
                    var updateProfile = {course: group_course, location: group_locattion, type: group_type, priOrPub: group_priOrPub, description: group_description, members: table.members, meetingTimes: group_time, meetingTopics: group_topic};
                    api.updateStudyTable(table._id, updateProfile, function(err, update) {
                        if (err) {
                            console.log(err);
                        } else {
                            //TODO: replace the information after update
                        }
                    });
                    update_form_parent.innerHTML = ``;
                    document.querySelector('#search_results').style.display = 'block';
                });
            });
            return element;
        }


    };




}());
