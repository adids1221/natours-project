const express = require('express');
const router = express.Router();
const viewsController = require('.././controllers/viewsController');
const authController = require('.././controllers/authController');
const bookingController = require('.././controllers/bookingController');

router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLogin);
router.get('/signup', viewsController.getSignup);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);
router.post('/submit-user-data', authController.protect, viewsController.updateUserData)

module.exports = router; 