const crypto = require('crypto');
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
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        minlength: 8,
        required: [true, 'Please enter your password'],
        select: false
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
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
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

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }
    //sub 1 sec from the passwordChangedAt time stamp to compare to the JWT timestamp
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

//instance method
//using bcrypt for compare password from the client and from the DB
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        //if the password changed for this user is
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(changedTimeStamp, JWTTimeStamp);
        //The time that the token was issued is less then changed time stamp
        return JWTTimeStamp < changedTimeStamp;
    }

    //by default the user didnt changed is password
    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    //sending an encrypted reset token to the DB
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    //sending the uncrypted reset token to the user email
    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;