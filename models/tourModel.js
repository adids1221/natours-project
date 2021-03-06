const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'], //validator
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal then 40 characters'],
        minlength: [10, 'A tour name must have at least 10 character']
        //validate: [validator.isAlpha, 'A tour name must have only alphabetic characters']
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
        max: [5, 'Rating must be below 5'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
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
    startDates: [{
        date: {
            type: Date,
            required: [true, 'A tour must have a start date']
        },
        participants: {
            type: Number,
            default: 0
        },
        soldOut: {
            type: Boolean,
            default: false
        }
    }], //array of dates
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        //GeoJSON - Embedded object
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number], //expect an arr of numbers
        address: String,
        description: String
    },
    locations: [ //arr of GeoJSON objects - Embedded document inside the parent document
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    //guides: Array --- array of user id's || embedding
    guides: [
        //Reference to the user data model without saving the guides in the tour data model
        //Child referencing
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},
    {
        //passing options, getting the virual properties to the document/object
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

//Compound index multiple-field index
tourSchema.index({ price: 1, ratingsAverage: -1 });
//Single-field index
tourSchema.index({ slug: 1 });
//Geo index
tourSchema.index({ startLocation: '2dsphere' });

//Define virtual properties
tourSchema.virtual('durationWeeks').get(function () {
    //using function declaration => using this keyword
    return this.duration / 7;
});

//Virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id', // Find tour where `localField`
    foreignField: 'tour' // is equal to `foreignField`
    //look for the _id of the tour in the tour field in review
});

//Document middleware 
tourSchema.pre('save', function (next) {
    //this function will be called before document saved to the DB
    //runs before .save() and .create() || .insertMany() will not trigger the function
    this.slug = slugify(this.name, { lower: true });
    next();
});

//Embedded users data model into tours data model
/* tourSchema.pre('save', async function (next) {
    const guidesPromise = this.guides.map(async id => await User.findById(id)); //creating arr of promises
    this.guides = await Promise.all(guidesPromise); //overwriting the arr of user id's with arr of user documentes
    next();
}); */

//-Query middleware
tourSchema.pre(/^find/, function (next) {
    //using regexp for all the find methods
    //this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function (next) {
    //using for populate all the query -> using reference
    this.populate({
        path: 'guides',
        select: '-__v'
    });
    next();
});

/* tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took: ${Date.now() - this.start} ms`);
    next();
}); */



//-Aggregation middleware
tourSchema.pre('aggregate', function (next) {
    const things = this.pipeline()[0];
    if (Object.keys(things)[0] !== '$geoNear') {
        this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    }
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

