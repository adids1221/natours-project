const mongoose = require('mongoose');
const validator = require('validator');

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
        minlength: 8,
        required: [true, 'Please enter confirm your password']
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;