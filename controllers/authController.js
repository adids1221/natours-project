const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }

    res.cookie('jwt', token, cookieOptions);

    //remove the password from the output
    user.password = undefined;

    return token;
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

    const createdToken = createSendToken(newUser, res);
    //console.log(createdToken);

    //email confirmation
    const confirmURL = `${req.protocol}://${req.get('host')}/api/v1/users/confirm/${createdToken}`;

    const message = `Hey ${newUser.name},\n Welcome to Natours, please confirm your email address for using our services.\n 
    Confirm: ${confirmURL}`;

    try {
        await sendEmail({
            email: newUser.email,
            subject: 'Welcome to Natours - Confirm your email to get started.',
            message
        });

        res.status(201).json({
            status: 'success',
            createdToken,
            data: {
                newUser
            }
        });

    } catch (err) {
        console.error(err);
        return next(new AppError('There was an error sending this email. Try agian later!', 500));
        //return next(err);
    }

});

exports.confirm = catchAsync(async (req, res, next) => {
    const decoded = await promisify(jwt.verify)(req.params.token, process.env.JWT_SECRET);
    await User.findByIdAndUpdate(decoded.id, { confirmed: true });
    res.status(204).json({
        status: 'success',
        message: `Thank you for confirmation, Welcome to Natours`
    });
});


exports.login = catchAsync(async (req, res, next) => {
    const { email, password, confirmed } = req.body;

    //check if email and password are exists
    if (!email || !password) {
        return next(new AppError('Please provide a valid email and password!', 400));
    }

    //check if the user exists and the password is correct
    const user = await User.findOne({ email }).select('+password +confirmed');

    if (!user.confirmed) {
        return next(new AppError('User havent been confirmed yet! \n Please confirm your email to login', 400));
    }

    //--compare the password from the client (req.body) and the password from the DB
    //--if the user is not exists or the password dosent match    
    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect email or password!', 401));
    }

    //send toekn to the client
    const createdToken = createSendToken(user, res);

    res.status(200).json({
        status: 'success',
        createdToken,
        data: {
            user
        }
    });
});

//protect route from users that are not login
exports.protect = catchAsync(async (req, res, next) => {
    let token;
    //getting the token and check if exists
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];;
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
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

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //get user based on POSTed emails
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with that email address', 404));
    }

    //genrate random token 
    const resetToken = user.createPasswordResetToken();
    //validateBeforeSave for Deactivate the validation in the schema
    await user.save({ validateBeforeSave: false });

    //send it back as an email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot Password? Submit your new password and confirm at: ${resetURL}.\n Didnt forgot your password please igonre this email`;

    try {
        await sendEmail({
            email: user.email, //req.body.email
            subject: 'Your password reset token valid for 10 min.',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to user email'
        });

    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending this email. Try agian later!', 500));
        //return next(err);
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //get user based on the token
    //--getting the token from the url
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    //checking the token expires stamp
    //--if the token is greater than the passwordResetExpires its still valid to use
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

    //if token has not expired, and there is a user, set a new passwordResetToken
    if (!user) {
        return next(new AppError('The token has expired.', 400));
    }

    //setting the new password to the user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //update and change the password, passwordChangedAt time stamp -- using middleware in userModel
    //log the user in, send JWT
    const createdToken = createSendToken(user, res);
    res.status(200).json({
        status: 'success',
        createdToken,
        data: {
            user
        }
    });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //get the user from the collection
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
        return next(new AppError('The user could not be found.', 400));
    }

    //check if the POSTed password is correct
    if (! await user.correctPassword(req.body.passwordCurrent, user.password)) {
        return next(new AppError('The password you entered is incorrect.', 401));
    }

    //if the password is correct, update the password

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //log user in, send JWT
    createSendToken(user, res);
    res.status(200).json({
        status: 'success',
        createdToken,
        data: {
            user
        }
    });
});

//Only for rendered pages
exports.isLoggedIn = catchAsync(async (req, res, next) => {
    if (req.cookies.jwt) {
        const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

        //check if the user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return next();
        }

        //if user changed password after the token was issued
        //iat => JWT time stamp (issued at)
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next();
        };

        //There is a loggedin user
        //refer to user var in pug file
        res.locals.user = currentUser;
        return next();
    }
    next();
});