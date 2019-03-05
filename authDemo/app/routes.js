// load up the user model
var User       = require('./models/user');
var mongoose   = require('mongoose');
var Gridfs     = require('gridfs-stream');
var py         = require('./python');
var fs         = require('fs');
var reload     = require('reload');

module.exports = function(app, passport, multer, sseMW, session) {

    // session variable in which session specific information is stored
    var sess; 
    // sse clients, Realtime updates
    var sseClients = new sseMW.Topic();

    app.get('/', function(req, res) {
        sess = req.session;
        res.render('index.ejs'); // load the index.ejs file
    });

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

    // Handle the server sent events (SSE)
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

    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', function(req, res) {

        sess = req.session;

        // sess.email = req.user.email;
        sess.email = "borisblokland@gmail.com";

        User.findOne({ 'email' :  sess.email }, function(err, user) {
            // check to see if theres already a user with that email
            if (user) 
            {
                console.log("Found user");
                res.render('profile.ejs', {
                    email : sess.email, // get the user email out of session and pass to template
                    user : JSON.stringify(user)         // pass the user as variable
                });
                return;
            } else {
                // could not find this user
                console.log("Could not find this user");
                return;
            }
        });
    });

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

    app.get('/download/:array/:filesort/:index', function(req, res){
        let index = req.params.index;
        let filesort = req.params.filesort;
        let array = req.params.array;
        User.findOne({ 'email' :  "borisblokland@gmail.com" }, function(err, user) {
            // create variables for response
            let name = user[array][index][filesort].filename;
            let type = user[array][index][filesort].filetype;
            let file = user[array][index][filesort].data

            // set headers for downloading
            res.setHeader('Content-Disposition', 'attachment; filename=' + `${name}.${type}`);
            res.setHeader('Content-Transfer-Encoding', 'binary');
            res.setHeader('Content-Type', 'application/octet-stream')
            
            // send back response
            res.send(file);
            return;
        });
    });

    app.post('/remove/:removefile/:email', function(req, res) {
        let email = req.params.email;
        let removefile = req.params.removefile; 
        let query = {}
        query[removefile] = []
        User.findOneAndUpdate({ 'email' :  email }, { $set: query}, {new: true}, (err, user) => {
            var sseConnection = sseClients.getConnection(email);
            sseConnection.send(user.stripBinary());
            sseConnection.send(`Removed all ${removefile}\r\n`)
        });
        
    });

    app.post('/upload/:uploadfile', upload.single('filename'), function(req, res) {
        sess = req.session;
        let email = sess.email;

        // check if session is still active, else force refresh
        if (email == null)
        {
            console.log("Email is unset, reload app")
            reload(app);
            return;
        }

        let uploadfile = req.params.uploadfile;
        res.send('File uploaded!<br>');
        var sseConnection = sseClients.getConnection(email);

        console.log("sse " + sseConnection)
        
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
            filepath = './python/OutOfBox_MSP430FR5969_print_hello.txt';
            filepath_python = './OutOfBox_MSP430FR5969_print_hello.txt'
            var filename = ["OutOfBox_MSP430FR5969_print_hello", "txt"];
        }
        
        User.findOne({ 'email' :  email }, function(err, user) 
        {
            var newDate = new Date();
            var options = {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
            newDate = newDate.toLocaleDateString('nl-NL', options);

            let file = fs.readFileSync(filepath); // read uploaded file from filesystem
            
            // get the filename and filetype
            let filetype = filename.pop();
            filename = filename.join();

            if (uploadfile === "testrun")
            {
                sseConnection.send("Uploading new testrun");

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
                py.start_python(sseConnection, filepath, user.testRuns[index]._id, email);
            }
            else if (uploadfile === "firmware")
            {
                sseConnection.send("Uploading new firmware");
                let index = user.addFirmware(
                    {
                        'date': newDate,
                        'firmware': {
                            'data'      : file,
                            'filename'  : filename,
                            'filetype'  : filetype
                        }
                    }
                );                
            }
            else
            {
                console.log(`Unsupported file upload ${uploadfile}`)
            }

            sseConnection.send(user.stripBinary());
        });
    });

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