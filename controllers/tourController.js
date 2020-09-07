const Tour = require('./../models/tourModel');

//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.checkBody = (req, res, next) => {
    if(!req.body.name || !req.body.price){
     return res.status(404).json({
            status:'error',
            message: `There was an error`})
    } 
    next();
}

exports.getAllTours = (req, res) => {
    console.log(req.requestTime);
    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
       /*  results: tours.length,
        data: {
            tours
        } */
    });
};

exports.getTour = (req, res) => { //parameter => :id || optinal parameter => :id?
    console.log(req.params);//req.params assign the value to the parameter => :id

    const id = req.params.id * 1; //convert from string to int
    /* const tour = tours.find(el => el.id === id);

    res.status(200).json({
    status: 'success',
    data: {
        tour
    } 
    }); */
};

exports.createTour = (req, res) =>{ //post => send data from the client/req to the server || add new tour
    res.status(201).json({ //HTTP status 201 gor create
        status: 'success',
        /* data: {
            tour: newTour
        } */
    });
};

exports.updateTour = (req, res) => { //update the data
    res.status(200).json({
        status: 'success', 
        data: {
            tour: `<Updated toure here...>`
        }
    });
};

exports.deleteTour = (req, res) => { //delete the data
    
    res.status(204).json({ //204 => no content
        status: 'success', 
        data: null //sending null back 
    });
};