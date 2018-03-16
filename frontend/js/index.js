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




    };




}());
