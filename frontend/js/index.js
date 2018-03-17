(function()
{
"use strict";

    window.onload = function()
    {

        //sign up
        var parent_div = document.getElementById('sign_up')
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
        var parent_sign_in_div = document.getElementById('log_in')
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
                    console.log(msg);
                    //TODO refresh page, since we are logged in.
                }

            });

        });

        // create study group
        // test to make sure the user right now
        console.log(api.getCurrentUser());
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
                }
            });
        });

        // display all tabls in selection
        /*
        api.getStudyTables(function(err, tables) {
            if (err) {
                console.log(err);
            } else {
                var element = document.createElement('select');
                element.className = "select_btn";
                element.id="selected";
                element.innerHTML += `<option value="null">--please select a study group--</option>`
                for (var i=0; tables[i] != null; i++) {
                    element.innerHTML += `<option value="${tables[i]}">${tables[i]}</option>`;
                }
                document.querySelector('#select_button').addEventListener("click", function(){
                    var selected_table = document.getElementById("selected").value;
                    // Enter the selected group
                    if (selected_table != "null") {
                        console.log(selected_table);
                    } else {
                        console.log("please choose a study group");
                    }

                })
                document.querySelector('#select_bar').prepend(element);
            }
        });
        */

        document.querySelector('#tables_button').addEventListener("click", function(){
            document.querySelector('#tables_button').classList.add("hidden");
            api.getStudyTables(function(err, tables) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(tables);
                    for (var i=0; tables[i] != null; i++) {
                        api.getStudyTable(tables[i], function(err, table) {
                            if (err) {
                                console.log(err);
                            } else {
                                var element = document.createElement("div");
                                console.log(table);
                                element.className = "table_item index_section";
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
                                        <button class="control">Enter</button>
                                        <button class="control">Edit</button>
                                    </div>
                                `
                                document.querySelector('#tables_div').prepend(element);
                            }
                        });
                    }
                }
            })

        })


    };




}());
