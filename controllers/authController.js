const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { use } = require('../routes/userRoutes');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    //newuser._id is the payload, JWT_SECRET is the secret
    const token = signToken(newUser._id);

    //sending token to the new user
    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //check if email and password are exists
    if (!email || !password) {
        return next(new AppError('Please provide a valid email and password!', 400))
    }

    //check if the user exists and the password is correct
    const user = await User.findOne({ email }).select('+password');
    //--compare the password from the client (req.body) and the password from the DB
    //--if the user is not exists or the password dosent match    
    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect email or password!', 401));
    }

    //send toekn to the client
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    });
});
