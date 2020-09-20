const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        role: req.body.role,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
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

//protect route from users that are not login
exports.protect = catchAsync(async (req, res, next) => {
    let token;
    //getting the token and check if exists
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];;
    }

    if (!token) { //Non token was sent with the header
        return next(new AppError('You are not loggen in! Please login to get access', 401));
    }

    //verification the token
    //--promisify return promise
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //check if the user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user does not longer exists', 401));
    }

    //if user changed password after the token was issued
    //iat => JWT time stamp (issued at)
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password, Please log in again', 401));
    };

    //grant access to protected route
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles arr || req.user is the currentUser from the protected middleware
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to preform this action.'));
        }
        next();
    }
}