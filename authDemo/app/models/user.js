// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define schema for files
var fileSchema = mongoose.Schema({
    data        : Buffer,
    filename    : String,
    filetype    : String 
});

// define schema for firmwares
var firmwareSchema = mongoose.Schema({
    date        : String,
    firmware    : fileSchema
});

// define schema for testRuns
var testRunSchema = mongoose.Schema({
    date        : String,
    status      : String,
    trace       : fileSchema,
    serial      : fileSchema,
    firmware    : fileSchema    
})

// define the schema for our user model
var userSchema = mongoose.Schema({
    email        : String,
    password     : String,
    firmwares    : [firmwareSchema],
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

userSchema.methods.addFirmware = function(firmware) {
    let size = this.firmwares.push(firmware);
    this.save(function(err) {
        if (err)
        {
            throw err;
        }
    });
    return size- 1; // return latest index = size-1
}

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

userSchema.methods.stripBinary = function() {
    copied_user = JSON.parse(JSON.stringify(this)); // deep copy
    copied_user.testRuns.forEach(function(testrun)
    {    
        if (testrun.firmware) testrun.firmware.data = '';  
        if (testrun.serial) testrun.serial.data = '';  
        if (testrun.trace) testrun.trace.data = '';
    });
    copied_user.firmwares.forEach(function(firmware)
    {    
        if (firmware.firmware) firmware.firmware.data = ''; 
    });
    return copied_user;
}

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);