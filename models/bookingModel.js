const mongoose = require('mongoose');
const Tour = require('./tourModel');

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking ,mmust belong to a tour']
    },
    date: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking ,mmust belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking ,mmust belong to a user']
    },
    price: {
        type: Number,
        required: [true, 'Booking must have a price']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
});

bookingSchema.pre(/^find/, function (next) {
    this.populate('user')
    .populate({
        path: 'tour',
        select: 'name'
    })
    .populate({
        path: 'tour',
        select: 'startDates'
    });
    next();
});

bookingSchema.pre('save', async function (next) {
    const tour = await Tour.findById(this.tour);
    const startDate = tour.startDates.id(this.date);
    // using tour.startDates.id(this.date) for the specific date
    if (startDate.participants > tour.maxGroupSize) {
        next(new AppError('This tour at this date is full, try another date', 403));
    }

    startDate.participants++;
    if (startDate.participants > tour.maxGroupSize) {
        startDate.soldOut = true;
    }
    await tour.save(); 
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;