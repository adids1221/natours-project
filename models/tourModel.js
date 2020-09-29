const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            maxlength: [40, 'A tour name must have less or equal then 40 characters'],
            minlength: [10, 'A tour name must have more or equal then 10 characters']
            // validate: [validator.isAlpha, 'Tour name must only contain characters']
        },
        slug: String,
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
            required: [true, 'A tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult'
            }
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
            set: val => Math.round(val * 10) / 10 // 4.666666, 46.6666, 47, 4.7
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
                    // this only points to current doc on NEW document creation
                    return val < this.price;
                },
                message: 'Discount price ({VALUE}) should be below regular price'
            }
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a description']
        },
        description: {
            type: String,
            trim: true
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image']
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false
        },
        startLocation: {
            // GeoJSON
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String
        },
        locations: [
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
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

/* const tourSchema = new mongoose.Schema({
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
); */

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

