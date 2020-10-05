const express = require('express');
const router = express.Router();
const viewsController = require('.././controllers/viewsController');


router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);

module.exports = router;