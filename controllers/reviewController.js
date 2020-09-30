const Review = require('./../models/reviewModel');
const Factory = require('./handlerFactory');

exports.SetTourUserIds = (req, res, next) => {
    //--if there is no tour id in the body take it from the url
    if (!req.body.tour) req.body.tour = req.params.tourId;
    //--get the user from the protect middleware
    if(!req.body.user) req.body.user = req.user.id;
    next();
};

exports.createReview = Factory.createOne(Review);
exports.updateReview = Factory.updateOne(Review);
exports.deleteReview = Factory.deleteOne(Review);
exports.getReview = Factory.getOne(Review);
exports.getAllReviews = Factory.getAll(Review);
