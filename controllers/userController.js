const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const Factory = require('./../controllers/handlerFactory');

//admin can update users data || Do not update passwords with this func
exports.updateUser = Factory.updateOne(User);
exports.deleteUser = Factory.deleteOne(User);
exports.getUser = Factory.getOne(User);
exports.getAllUsers = Factory.getAll(User);

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

exports.getMe = (req, res, next) => {
    //using the current loged in user ID
    req.params.id = req.user.id;
    next();
};

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

exports.deleteMe = catchAsync(async (req, res, next) => {
    //dont delete the user but set his active to false and dont show it among the other users
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route has not yet defined.\n Please use /signup insted'
    });
};