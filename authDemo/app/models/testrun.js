// load the things we need
var mongoose = require('mongoose');


// define the schema for our user model
var testRunSchema = new mongoose.Schema({

    date        : Date,
    targetNode  : String,
    status      : String,
    binary      : Buffer,
    result      : Buffer

});

// create the model for users and expose it to our app
module.exports = testRunSchema;