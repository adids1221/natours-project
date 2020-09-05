const express = require('express'); 
const fs = require('fs');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();


//1) MIDDLEWARE
app.use(morgan('dev'));

app.use(express.json());//middleware -> in the middle of the req and the res

app.use((req, res, next) => {
    //next is middleware express function
    console.log('new middleware ');
    next();
});

app.use((req, res,next)=> {//middleware
    req.requestTime = new Date().toISOString();//the time the request was made
    next();
});

//3) ROUTES - mount our routers
app.use('/api/v1/tours', tourRouter);//using the middleware
app.use('/api/v1/users', userRouter);

//4)SERVER
module.exports = app;

