const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
    //allowedFields is arr of the parameter sent from the function
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
    const users = await User.find();

    //Send response 
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    });
});

//current user update his own data
exports.updateMe = catchAsync(async (req, res, next) => {
    //create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password update. Please use /updateMyPassword', 400));
    }

    //filterd out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');

    //update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

//admin can update users data
exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route has not yet defined'
    });
};

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route has not yet defined'
    });
};

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route has not yet defined'
    });
};

exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route has not yet defined'
    });
};