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
        sseConnection.send("Hello world!");
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
        
        // sess.email = req.user.local.email;
        // console.log("email:" + sess.email);

        // =====================================================================
        // THIS CODE IS FOR DEBUGGING ONLY
        // =====================================================================
        sess.email = "borisblokland@gmail.com";
        // =====================================================================

        User.findOne({ 'local.email' :  sess.email }, function(err, user) {
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
         //cb(null, file.fieldname + '-' + Date.now())
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

    app.get('/download/:tagid', function(req, res){
        console.log(req.params.tagid);
        User.findOne({ 'local.email' :  "borisblokland@gmail.com" }, function(err, user) {
            // if there are any errors, return the error
            if (err) {
                console.log("got error: " + err);
                throw err;
                return;
            }

            // check to see if theres already a user with that email
            if (user) {
                console.log(user)
                console.log(user.local.testRuns[1].binary)


                res.setHeader('Content-Disposition', 'attachment; filename=' + "binary.txt");
                res.setHeader('Content-Transfer-Encoding', 'binary');
                res.setHeader('Content-Type', 'application/octet-stream')
                
                res.send(user.local.testRuns[1].binary);
                return;
            } else {

                // could not find this user
                console.log("Could not find this user");
                return;
            }

        });
    });

    app.post('/fileupload', upload.single('file'), function(req, res, next) {
        sess = req.session;
        console.log("user @ fileupload: " + sess.user);
        let user_email = sess.email;

        user_email = "borisblokland@gmail.com";

        res.send('File uploaded!<br>');

        let sseConnection = sseClients.getConnection(user_email);
        let filepath = req.file.destination + '/' + req.file.filename;

        console.log(`Constructed path: ${filepath}`);

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        console.log("email:" + sess.email);
        console.log('file name:' + req.file.filename);
        console.log('file destination:' + req.file.destination);


        User.findOne({ 'local.email' :  user_email }, function(err, user) {
            // if there are any errors, return the error
            if (err) {
                console.log("got error: " + err);
                throw err;
                return;
            }

            // check to see if theres already a user with that email
            if (user) {
                console.log("Feel free to update this user");
                let newDate = new Date();
                let file = fs.readFileSync('./python/OutOfBox_MSP430FR5969.txt');
                let index = user.addTestrun(
                    {
                        'date': newDate,
                        'binary': file,
                        'status': "pending"
                    }
                );
                console.log(index);
                console.log(user.local.testRuns[index]);
                console.log(user.local.testRuns[index]._id);

                // First try to only pass reference of current object to callback
                py.start_python(sseConnection, filepath, user.local.testRuns[index]._id);

                return;
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