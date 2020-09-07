const express = require('express');
const tourController = require('./../controllers/tourController');
const router = express.Router();//middleware function

/* router.param('id', tourController.checkID); */

router
.route('/')
.get(tourController.getAllTours)
.post(tourController.checkBody, tourController.createTour);
//chaining middleware

router
.route('/:id')
.get(tourController.getTour)
.patch(tourController.updateTour)
.delete(tourController.deleteTour);

module.exports = router;