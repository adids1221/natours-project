const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const Tour = require('./tourModel');

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
    /* this.populate({
        path: 'tour',
        options: { select: 'name' } 
    }).populate({
        path: 'user',
        options: { select: 'name photo' } 
    }); */
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

//Static Methods
reviewSchema.statics.calcAverageRating = async function (tourId) {
    console.log(tourId);
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    //console.log(stats);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantaity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantaity: 0,
            ratingsAverage: 4.5
        });
    }
};

reviewSchema.post('save', function (next) {
    //this points to the current review
    //this.constructor points to the Model itself
    //Using static method that can be used on the Model itself
    this.constructor.calcAverageRating(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
    //Using regex for FindOneAnd query functions -> Delete and Update
    //this points to the current query
    //Saving the query to this.r object for using in the next middleware
    this.r = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    //Cant use this.findOne in the post middleware the query already executed
    //Using this.r object passed from the pre middleware
    //Post middleware on FindOneAnd query functions
    await this.r.constructor.calcAverageRating(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;