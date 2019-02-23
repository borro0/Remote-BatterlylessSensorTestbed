// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define schema for files
var fileSchema = mongoose.Schema({
    data        : Buffer,
    filename    : String,
    filetype    : String 
});

// define schema for testRuns
var testRunSchema = mongoose.Schema({
    date     : String,
    status   : String,
    trace    : fileSchema,
    firmware : fileSchema    
})

// define the schema for our user model
var userSchema = mongoose.Schema({


    email        : String,
    password     : String,
    testRuns     : [testRunSchema]
}, 
{
  usePushEach: true
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.addTestrun = function(testRun) {
    let size = this.testRuns.push(testRun);
    this.save(function(err) {
        if (err)
        {
            throw err;
        }
    });
    return size- 1; // return latest index = size-1
}

userSchema.methods.stripBinary = function(testRun) {
    this.testRuns.forEach(function(testRun)
    {
        testRun.firmware.data = '';
    });
    return this;
}

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);