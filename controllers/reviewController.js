const AppError = require('../utils/appError');
const Review = require('./../models/reviewModel');
const APIFeatures = require(`${__dirname}/../utils/apiFeatures.js`);
const catchAsync = require('./../utils/catchAsync');

//TODO: fix AppError error -> Unhandeld route for /api/v1/reviews at the app.js

exports.getAllReviews = catchAsync(async (req, res, next) => {
    /* const features = new APIFeatures(Review.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const reviews = await features.query; */

    const reviews = await Review.find({}, '-__v')

    res.status(200).json({
        status: 'success',
        data: {
            review: reviews
        }
    });

    next();
});

exports.createReview = catchAsync(async (req, res, next) => {
    const newReview = await Review.create(req.body);

    res.status(200).json({
        status: 'success',
        data: {
            newReview
        }
    });

    next();
});