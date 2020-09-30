const AppError = require('../utils/appError');
const Review = require('./../models/reviewModel');
const APIFeatures = require(`${__dirname}/../utils/apiFeatures.js`);
const catchAsync = require('./../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    
    //creating GET Endpoint for the Nested routes || Get all the reviews for tour by tourId
    if(req.params.tourId) filter = {tour : req.params.tourId};
    
    const reviews = await Review.find(filter, '-__v');

    res.status(200).json({
        status: 'success',
        data: {
            review: reviews
        }
    });
});

exports.createReview = catchAsync(async (req, res, next) => {
    //Nested routes
    //--if there is no tour id in the body take it from the url
    if (!req.body.tour) req.body.tour = req.params.tourId;
    //--get the user from the protect middleware
    if(!req.body.user) req.body.user = req.user.id;

    const newReview = await Review.create(req.body);

    res.status(200).json({
        status: 'success',
        data: {
            newReview
        }
    });
});