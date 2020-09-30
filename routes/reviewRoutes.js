const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

//mergeParams - Preserve the req.params values from the parent router (tourRoutes)
const router = express.Router({ mergeParams: true });//middleware function

//Authenticate Routes - protect all router after this middleware
router.use(authController.protect);

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.restrictTo('user'),
        reviewController.SetTourUserIds,
        reviewController.createReview);

router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = router;