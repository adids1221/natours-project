const Tour = require('./../models/tourModel');

//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.getAllTours = async (req, res) => {
    try {
        const tours = await Tour.find();//show the collection
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail to show collection',
            message: err
        })
    }
};

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
        })
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
        })
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
        })
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
        })
    }

};