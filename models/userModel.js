const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name']
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email'],
        required: [true, 'Please enter your email']
    },
    photo: String,
    password: {
        type: String,
        minlength: 8,
        required: [true, 'Please enter your password']
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please enter confirm your password'],
        validate: {
            //Only work on Create and Save 
            validator: function (el) {
                return el === this.password;
            }, message: 'Passwords are not the same'
        }
    }
});

//pre('save') => between getting the data for the model and passing it to the db
userSchema.pre('save', async function (next) {
    //run if password was modified
    if (!this.isModified('password')) {
        return next();
    }

    //hash the password with hash of 12
    this.password = await bcrypt.hash(this.password, 12);
    //passwordConfirm data is required input only, not required for the db
    //delete passwordConfirm
    this.passwordConfirm = undefined;
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;