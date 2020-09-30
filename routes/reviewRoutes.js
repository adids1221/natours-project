const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

//mergeParams - Preserve the req.params values from the parent router (tourRoutes)
const router = express.Router({mergeParams: true});//middleware function

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewController.createReview);

module.exports = router;