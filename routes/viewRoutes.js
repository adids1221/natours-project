const express = require('express');
const router = express.Router();
const viewsController = require('.././controllers/viewsController');
const authController = require('.././controllers/authController')

router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLogin);

module.exports = router;