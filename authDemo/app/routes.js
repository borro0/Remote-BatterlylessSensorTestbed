// load up the user model
var User       = require('./models/user');
var mongoose   = require('mongoose');
var Gridfs     = require('gridfs-stream');
var py         = require('./python');
var fs         = require('fs');

module.exports = function(app, passport, multer, sseMW, session) {

    // session variable in which session specific information is stored
    var sess; 

    // sse clients, Realtime updates
    var sseClients = new sseMW.Topic();

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        sess = req.session;
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SERVER SIGNAL EVENTS ================
    // =====================================

    app.get('/updates', function (req, res) {
        sess = req.session;

        console.log("res (should have sseConnection)= " + res.sseConnection);
        var sseConnection = res.sseConnection;
        console.log("sseConnection= ");
        sseConnection.setup();
        sseClients.add(sess.email, sseConnection);
        console.log(`sess.email @ updates ${sess.email}`);
        sseConnection.send("Hello!\r\n");
    });

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', function(req, res) {

        sess = req.session;

        // =====================================================================
        // THIS CODE IS PRODUCTION CODE
        // =====================================================================
        
        // sess.email = req.user.email;
        // console.log("email:" + sess.email);

        // =====================================================================
        // THIS CODE IS FOR DEBUGGING ONLY
        // =====================================================================
        sess.email = "borisblokland@gmail.com";
        // =====================================================================

        User.findOne({ 'email' :  sess.email }, function(err, user) {
            // if there are any errors, return the error
            if (err) {
                console.log("got error: " + err);
                throw err;
                return;
            }

            // check to see if theres already a user with that email
            if (user) 
            {
                console.log("Found user");
                res.render('profile.ejs', {
                    email : sess.email, // get the user email out of session and pass to template
                    user : user         // pass the user as variable
                });
                return;
            } else {

                // could not find this user
                console.log("Could not find this user");
                return;
            }

        });
    });

    // =====================================
    // FILE UPLOAD =========================
    // =====================================
    // Here we handle file uploading

    var storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, './uploads')
        },
        filename: (req, file, cb) => {
         cb(null, file.originalname)
        }
    });
    var upload = multer({storage: storage});

    app.post('/plugin-fileupload', upload.single('file'), function(req, res) {

        console.log(req.body);
        console.log(req.file);

        res.send({ 
            email: req.body.email,
            password: req.body.password,
            file: req.file.originalname
        });
    });

    app.get('/download/:index', function(req, res){
        let index = req.params.index;
        console.log(index);
        User.findOne({ 'email' :  "borisblokland@gmail.com" }, function(err, user) {
            // if there are any errors, return the error
            if (err) {
                console.log("got error: " + err);
                throw err;
                return;
            }

            // check to see if theres already a user with that email
            if (user) {
                console.log(user);
                console.log(user.testRuns[index].firmware.filename);

                let name = user.testRuns[index].firmware.filename;
                let type = user.testRuns[index].firmware.filetype;
                let file = user.testRuns[index].firmware.data

                let fullname = `${name}.${type}`;
                console.log(fullname);

                res.setHeader('Content-Disposition', 'attachment; filename=' + `${name}.${type}`);
                res.setHeader('Content-Transfer-Encoding', 'binary');
                res.setHeader('Content-Type', 'application/octet-stream')
                
                res.send(file);
                return;
            } else {

                // could not find this user
                console.log("Could not find this user");
                return;
            }

        });
    });

    app.get('/user', function(req, res) {
        console.log(req.body);
        User.findOne({ 'email' :  "borisblokland@gmail.com" }, function(err, user) {
            res.send(user);
        });
        
    });

    app.post('/fileupload', upload.single('file'), function(req, res) {
        sess = req.session;
        console.log("user @ fileupload: " + sess.user);
        let user_email = sess.email;

        user_email = "borisblokland@gmail.com";

        res.send('File uploaded!<br>');

        let sseConnection = sseClients.getConnection(user_email);
        
        let filepath = '';
        if(req.file) // check if file is given
        {
            filepath = req.file.destination + '/' + req.file.filename;
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            console.log("email:" + sess.email);
            console.log('file name:' + req.file.filename);
            console.log('file destination:' + req.file.destination);
            var filename = req.file.filename.split('.');
        }
        else // no file is given, use default
        {
            filepath = './python/OutOfBox_MSP430FR5969.txt';
            var filename = ["OutOfBox_MSP430FR5969", "txt"];
        }
        

        console.log(`Constructed path: ${filepath}`);

        User.findOne({ 'email' :  user_email }, function(err, user) {
            // if there are any errors, return the error
            if (err) {
                console.log("got error: " + err);
                throw err;
                return;
            }

            // check to see if theres already a user with that email
            if (user) {
                console.log("Feel free to update this user");

                let newDate = new Date(); // get current date
                newDate.setTime( newDate.getTime() + 1 * 60 * 60 * 1000 );
                newDate.toISOString().slice(0,24);
                let file = fs.readFileSync(filepath); // read uploaded file from filesystem
                
                // get the filename and filetype
                
                let filetype = filename.pop();
                filename = filename.join();
                console.log(`Filename: ${filename}.${filetype}`);
                console.log(filetype);

                // upload
                let index = user.addTestrun(
                    {
                        'date': newDate,
                        'status': "pending",
                        'firmware': {
                            'data'      : file,
                            'filename'  : filename,
                            'filetype'  : filetype
                        }
                    }
                );

                // To do this, you must remove the iframe target in profile.ejs
                // res.render('profile.ejs', {
                //     email : user_email, // get the user email out of session and pass to template
                //     user : user         // pass the user as variable
                // });

                // First try to only pass reference of current object to callback
                sseConnection.send("Something\r\n");
                
                sseConnection.send(user);
                py.start_python(sseConnection, filepath, user.testRuns[index]._id);
                

            } else {

                // could not find this user
                console.log("Could not find this user");
                return;
            }
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}