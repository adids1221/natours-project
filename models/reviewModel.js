const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const reviewSchema = new mongoose.Schema({
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
        default: Date.now(),
    },
    tour: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must be belong to a tour.']
        }
    ],
    user: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must be belong to a user.']
        }
    ]
},
    {
        //passing options, getting the virual properties to the document/object
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);


//Query middleware
reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'tour',
        select: 'name'
    })
        .populate({
            path: 'user',
            select: 'name'
        });

    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;