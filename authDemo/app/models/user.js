// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {

        email        : String,
        password     : String,
        testRuns     : [{

            date                : Date,
            binary              : Buffer,
            outputTraceFilePath : String,
            status              : String
            //targetNode  : String,
            //result      : Buffer
            
        }]
    }

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
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.addTestrun = function(testRun) {
    let size = this.local.testRuns.push(testRun);
    this.save(function(err) {
        if (err)
        {
            throw err;
        }
    });
    return size-1; // return latest index = size-1
}

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);