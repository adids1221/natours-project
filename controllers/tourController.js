const Tour = require('./../models/tourModel');
const APIFeatures = require(`${__dirname}/../utils/apiFeatures.js`);

//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.aliasTopTours = (req, res, next) => {
    //prefilling the query
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = async (req, res) => {
    try {
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
    } catch (err) {
        console.log(err)
        res.status(404).json({
            status: 'fail to show collection',
            message: err
        });
    }
}

exports.getTour = async (req, res) => { //parameter => :id || optinal parameter => :id?
    try {
        const tour = await Tour.findById(req.params.id);
        //Tour.findOne({_id req.params.id})
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail to show the tour',
            message: err
        });
    }
};

exports.createTour = async (req, res) => {
    try {
        /* const newTour = new Tour()
        newTour.save() */
        const newTour = await Tour.create(req.body);//the new document with all the Tour object fileds
        res.status(201).json({ //HTTP status 201 for create
            status: 'success',
            data: {
                tour: newTour
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail to create new tour',
            message: "Invalid data sent!"
        });
    }
};

exports.updateTour = async (req, res) => { //update the data
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true //return the modified document
        });
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail to update the tour',
            message: err
        });
    }
};

exports.deleteTour = async (req, res) => { //delete the data
    try {
        await Tour.findByIdAndRemove(req.params.id);
        res.status(204).json({ //204 => no content
            status: 'success',
            data: null //sending null back 
        });
    } catch (err) {
        res.status(404).json({
            status: 'no such id to delete',
            message: err
        });
    }

};

exports.getTourStats = async (req, res) => {
    try {
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
                $sort: { avgPrice: 1 }
            }
            /* {
                $match: { _id: { $ne: 'EASY' } }
            } */
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        });

    } catch (err) {
        res.status(404).json({
            status: 'no such id to delete',
            message: err
        });
    }
}