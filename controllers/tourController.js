const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.checkID = (req, res, next, val) => {
    console.log(`This is the id: ${val}`);
    if(req.params.id * 1 > tours.length){
        return res.status(404).json({
            status:'failed' ,
            message: `Failed to find tour id:${req.params.id * 1}`
        });
    }
    next();
}

exports.getAllTours = (req, res) => {
    console.log(req.requestTime);
    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    });
};

exports.getTour = (req, res) => { //parameter => :id || optinal parameter => :id?
    console.log(req.params);//req.params assign the value to the parameter => :id

    const id = req.params.id * 1; //convert from string to int
    const tour = tours.find(el => el.id === id);

    res.status(200).json({
    status: 'success',
    data: {
        tour
    } 
    });
};

exports.createTour = (req, res) =>{ //post => send data from the client/req to the server || add new tour
    const newId = ((tours[tours.length-1].id) + 1);
    console.log(newId);
    const newTour = Object.assign({id: newId}, req.body);

    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({ //HTTP status 201 gor create
            status: 'success',
            data: {
                tour: newTour
            }
        });
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