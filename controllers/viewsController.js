const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

exports.getOverview = catchAsync(async (req, res) => {
    //Get all the tour data from our collection 
    const tours = await Tour.find();
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    const isBooked = await Booking.find({ user: req.user.id, tour: tour.id });
    const tourDate = isBooked.date;

    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }

    res.status(200).render('tour', {
        status: 'success',
        title: tour.name,
        isBooked,
        tourDate,
        tour
    });
});

exports.getLogin = (req, res) => {
    res.status(200).render('login', {
        status: 'success',
        title: 'Login'
    });
};

exports.getSignup = (req, res) => {
    res.status(200).render('signup', {
        status: 'success',
        title: 'Signup'
    });
};

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        status: 'success',
        title: 'Your Account'
    });
};

exports.getMyTours = async (req, res, next) => {
    const bookings = await Booking.find({ user: req.user.id });
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    });
}

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email
        },
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser
    });
});
