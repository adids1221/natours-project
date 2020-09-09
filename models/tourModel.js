const mongoose = require('mongoose');
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'], //validator
        unique: true,
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficuulty level']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantaity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: Number,
    summery: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a image cover']
    },
    images: [String], //array of strings 
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date] //array of dates
}, {
    //passing options, getting the virual properties to the document/object
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

//Define virtual properties
tourSchema.virtual('durationWeeks').get(function () {
    //using function declaration => using this keyword
    return this.duration / 7;
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;