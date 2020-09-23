const AppError = require('../utils/appError');
const Review = require('./../models/reviewModel');
const APIFeatures = require(`${__dirname}/../utils/apiFeatures.js`);
const catchAsync = require('./../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find({}, '-__v');

    res.status(200).json({
        status: 'success',
        data: {
            review: reviews
        }
    });
});

exports.createReview = catchAsync(async (req, res, next) => {
    const newReview = await Review.create(req.body);

    res.status(200).json({
        status: 'success',
        data: {
            newReview
        }
    });
});