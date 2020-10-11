const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const Factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image please upload only images', 400), false);
    }
};
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

//upload.fields for uploadiong few photos
exports.uploadTourImages = upload.fields([
    //arr of properties, each property is in the tourModel
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);

/*
*upload.fields is qual to:*
upload.single('imageCover')
upload.array('iamges', 5)
*/

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();

    //using req.body to update the file name because the next middleware (updateOne in handlerFactory) is using req.body for updating the tour

    //Processing the cover image
    req.body.imageCover = `tours-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    //Processing the arr of images
    req.body.images = [];
    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `tours-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
            //the current file buffer
            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`);

            req.body.images.push(filename);
        })
    ); proccesing
    next();
});

//calling the Factory methods on the Tour model
exports.createTour = Factory.createOne(Tour);
exports.updateTour = Factory.updateOne(Tour);
exports.deleteTour = Factory.deleteOne(Tour);
exports.getTour = Factory.getOne(Tour, { path: 'reviews' });
exports.getAllTours = Factory.getAll(Tour);

exports.aliasTopTours = (req, res, next) => {
    //prefilling the query
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

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

//tours-within/233/center/31.914912,34.869772/unit/mi

exports.getToursWithin = catchAsync(async (req, res, next) => {
    //Use destrcturing 
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    //Convert the radius to radians
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        next(AppError('Please provide your location in the format required lat/lng', 400));
    }

    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });

    //console.log(distance, lat, lng, unit);

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    //Use destrcturing 
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
        next(AppError('Please provide your location in the format required lat/lng', 400));
    }

    const multiplayer = unit === 'mi' ? 0.000621371 : 0.001;

    const distances = await Tour.aggregate([
        {
            //Geospatial aggregation pipeline must start with geoNear || using Geo index
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplayer
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    });
});