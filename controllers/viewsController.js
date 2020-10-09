const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }

    res.status(200).render('tour', {
        status: 'success',
        title: tour.name,
        tour 
    });
});

exports.getLogin = (req, res) => {
    res.status(200).render('login', {
        status: 'success',
        title: 'Login'
    });
};

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        status: 'success',
        title: 'Your Account' 
    })
}