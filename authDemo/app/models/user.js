// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var testRun  = require('./testrun.js');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {

        email        : String,
        password     : String,
        testRuns     : {

            date        : Date,
            targetNode  : String,
            status      : String,
            binary      : Buffer,
            result      : Buffer
            
        }
    }

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);