// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var multer 	 = require('multer');
var flash    = require('connect-flash');
var sseMW    = require('./app/sse');
var reload   = require('reload');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var reload = require('reload');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url, { 
	useMongoClient: true 
}); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({ 
	extended: true 
})); // used to parse HTML
app.use(bodyParser.json()); // used to parse HTML
app.use(sseMW.sseMiddleware); // setup our server-sent-events

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ 
    secret: 'ilovescotchscotchyscotchscotch',
    name: 'hello_cookie',
    proxy: true,
    resave: true,
    saveUninitialized: true

})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static(__dirname + '/public'));

// routes ======================================================================
require('./app/routes.js')(app, passport, multer, sseMW, session); // load our routes and pass in our app and fully configured passport

// Reload code here
console.log("reloading app")
// reload(app);

// launch ======================================================================
app.listen(port);

console.log('The magic happens on port ' + port);