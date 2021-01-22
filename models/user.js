const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose'); //Auto adds username and password
const Schema = mongoose.Schema;

//Main document
const userSchema = new Schema({
    firstname: {
        type: String,
        default: ""
    },
    lastname: {
        type: String,
        default: ""
    },
    facebookId: String,
    admin: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(passportLocalMongoose); //Auto adds username and password and will also encrypt them

module.exports = mongoose.model('User', userSchema);