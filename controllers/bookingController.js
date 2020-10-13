const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const Factory = require('./handlerFactory');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    //Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);
    const startDateId = req.params.startDateId;
    /* if(tour.price > 1000){
        //re authentication

    } */

    //Create check-out session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}&startDateId=${startDateId}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    });

    //Create session as response
    res.status(200).json({
        status: 'success',
        session
    });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    //This is temporary, unsecure route
    const { tour, user, price , startDateId } = req.query;
    if (!tour && !user && !price) {
        return next();
    }
    await Booking.create({ tour, user, price, date: startDateId });
    res.redirect(req.originalUrl.split('?')[0]);
});


exports.getBooking = Factory.getOne(Booking);
exports.getAllBookings = Factory.getAll(Booking);
exports.createBooking = Factory.createOne(Booking);
exports.updateBooking = Factory.updateOne(Booking);
exports.deleteBooking = Factory.deleteOne(Booking);