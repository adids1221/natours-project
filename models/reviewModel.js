const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty!']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour.']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user']
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


//Query middleware
reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'tour',
        options: { select: 'name' } // <-- wrap `select` in `options` here...
    }).populate({
        path: 'user',
        options: { select: 'name photo' } // <-- and here
    });

    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;