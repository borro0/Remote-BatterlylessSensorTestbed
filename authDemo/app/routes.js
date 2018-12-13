// load up the user model
var User       = require('./models/user');
var TestRun    = require('./models/testrun.js');
var session    = require('express-session');

module.exports = function(app, passport, multer) {

    // session variable in which session specific information is stored
    var sess; 

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
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        sess = req.session;
        sess.email = req.user.local.email;
        sess.user = req.user;
        console.log("email:" + sess.email);
        console.log("user @ profile: " + sess.user);

        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
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
         cb(null, file.fieldname + '-' + Date.now())
        }
    });
    var upload = multer({storage: storage});

    app.post('/fileupload', upload.single('file'), function(req, res, next) {
        sess = req.session;
        console.log("user @ fileupload: " + sess.user);

        res.render('profile.ejs', {
            user : sess.user // get the user out of session and pass to template
        });
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        console.log("email:" + sess.email);
        console.log('file name:' + req.filename);
        console.log('file destination:' + req.destination);

        User.findOne({ 'local.email' :  sess.user.email }, function(err, user) {
            // if there are any errors, return the error
            if (err) {
                console.log("got error: " + err);
                throw err;
                return;
            }

            // check to see if theres already a user with that email
            if (user) {
                console.log("User already exits" + user);
                return;
            } else {

                // if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.email    = "test";
                newUser.local.password = "123";
                newUser.local.testRuns.targetNode = "testNode";
                newUser.local.testRuns.binary = req.file;

                // save the user
                newUser.save(function(err) {
                    if (err) {
                        console.log("Got error in storing image");
                        throw err;
                    }
                    return;
                });
            }

        });
        //console.log(req.user);
    });
        // MongoClient.connect(url, (err, db) => {
        //     assert.equal(null, err);
        //     insertDocuments(db, 'uploads/' + req.file.filename, () => {
        //         db.close();
        //         res.json({'message': 'File uploaded successfully'});
        //     });
        // });

    var insertDocuments = function(db, filePath, callback) {
        var collection = db.collection('user');
        collection.insertOne({'imagePath' : filePath }, (err, result) => {
            assert.equal(err, null);
            callback(result);
        });
    }

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