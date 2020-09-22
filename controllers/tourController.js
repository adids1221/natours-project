const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const APIFeatures = require(`${__dirname}/../utils/apiFeatures.js`);
const catchAsync = require('./../utils/catchAsync');

//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.aliasTopTours = (req, res, next) => {
    //prefilling the query
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);//the new document with all the Tour object fileds
    res.status(201).json({ //HTTP status 201 for create
        status: 'success',
        data: {
            tour: newTour
        }
    });
});

exports.getAllTours = catchAsync(async (req, res, next) => {
    //Execute the query
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const tours = await features.query;

    //Send response 
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    });
});

exports.getTour = catchAsync(async (req, res, next) => { //parameter => :id || optinal parameter => :id?
    //populate reference to the guides in the user data model
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
        return next(new AppError('No tour found with that id', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
});

exports.updateTour = catchAsync(async (req, res, next) => { //update the data
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true, //return the modified document
        runValidators: true
    }, (err) => {
        if (err) {
            return next(err);
        }
    });

    if (!tour) {
        return next(new AppError('No tour found with that id', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
});

exports.deleteTour = catchAsync(async (req, res, next) => { //delete the data
    const tour = await Tour.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            return next(new AppError(`Not a valid ID: ${req.params.id}`, 404));
        }
    });

    if (!tour) {
        return next(new AppError('No tour found with that id', 404));
    }

    res.status(204).json({ //204 => no content
        status: 'success',
        data: null //sending null back 
    });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        //array of stages to define the sequence
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantaity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }//ascending 
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    //Calc the busiest month of the year
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0,
            }
        },
        {
            $sort: { numTourStarts: -1 } //descending
        },
        {
            $limit: 6
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });
});