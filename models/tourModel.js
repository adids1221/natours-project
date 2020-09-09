const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'], //validator
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal then 40 characters'],
        minlength: [10, 'A tour name must have at least 10 character'],
        validate: [validator.isAlpha, 'A tour name must have only alphabetic characters']
    },
    slug: {
        type: String
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
        required: [true, 'A tour must have a difficuulty level'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either "easy", "medium" or "difficult"'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1'],
        max: [5, 'Rating must be below 5']
    },
    ratingsQuantaity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) shoulld be below the regular price'
        }
    },
    summary: {
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
    startDates: [Date], //array of dates
    secretTour: {
        type: Boolean,
        default: false
    }
},
    {
        //passing options, getting the virual properties to the document/object
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

//Define virtual properties
tourSchema.virtual('durationWeeks').get(function () {
    //using function declaration => using this keyword
    return this.duration / 7;
});

//Mongoose middleware 
//-Document middleware 
tourSchema.pre('save', function (next) {
    //this function will be called before document saved to the DB
    //runs before .save() and .create() || .insertMany() will not trigger the function
    this.slug = slugify(this.name, { lower: true });
    next();
});

/* tourSchema.pre('save', function (next) {
    console.log('Will save document');
    next();
});

//Post middleware
tourSchema.post('save', function (doc, next) {
    //this middleware execute after all the pre middleware functions are completed
    console.log(doc);
    next();
}); */

//-Query middleware
tourSchema.pre(/^find/, function (next) {
    //using regexp for all the find methods
    //this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took: ${Date.now() - this.start} ms`);
    next();
});

//-Aggregation middleware
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    console.log(this.pipeline());
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

