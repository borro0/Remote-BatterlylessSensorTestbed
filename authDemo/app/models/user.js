// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({


    email        : String,
    password     : String,
    testRuns     : [{

        date     : String,
        status   : String,
        firmware : {

            data : Buffer,
            filename : String,
            filetype : String
        }
    }]
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
    return size-1; // return latest index = size-1
}

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);