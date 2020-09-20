const express = require('express'); 
const fs = require('fs');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//1) MIDDLEWARE
//console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV === 'development'){//same process as in serve.js
    app.use(morgan('dev'));
}
app.use(express.json());//middleware -> in the middle of the req and the res
app.use(express.static(`${__dirname}/public`));//looking for static files - if we dont find any routes that match the app will go to /public and look for static files

app.use((req, res,next)=> {//middleware
    req.requestTime = new Date().toISOString();//the time the request was made
    console.log(req.headers);
    next();
});

//3) ROUTES - mount our routers
app.use('/api/v1/tours', tourRouter);//using the middleware
app.use('/api/v1/users', userRouter);

//Unhandeld routes
app.all('*', (req,res,next) => {
    next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
    //if next() recive an argument express handle it's an error -> skip all the middleware in the stack
});

//Error handeling middleware
app.use(globalErrorHandler);

//4)SERVER
module.exports = app;

