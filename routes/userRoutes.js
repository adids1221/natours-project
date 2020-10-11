const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
    .post('/login', authController.login);

router
    .get('/logout', authController.logout);

router
    .post('/signup', authController.signup);

router
    .post('/forgotPassword', authController.forgotPassword);

router
    .patch('/resetPassword/:token', authController.resetPassword);

router
    .get('/confirm/:token', authController.confirm);

//Authenticate Routes - protect all router after this middleware
router.use(authController.protect);

router
    .patch('/updateMyPassword', authController.updatePassword);

router
    .patch(
        '/updateMe',
        userController.uploadUserPhoto,
        userController.resizeUserPhoto,
        userController.updateMe);

router
    .delete('/deleteMe', userController.deleteMe);

router
    .get('/me', userController.getMe, userController.getUser);

//Restrict the next routes for admin
router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;