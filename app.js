const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

//TODO: fix AppError error -> Unhandeld route for /api/v1/reviews at the app.js

const app = express();

//1) GLOBAL MIDDLEWARE
//Set security http headers
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {//same process as in serve.js
    app.use(morgan('dev'));
}

//Limit request from the same IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, try again later.'
});

app.use('/api', limiter);

//Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));

//Data sanitization agiant NoSQL query injection
app.use(mongoSanitize());

//Data sanitization agiant XSS
app.use(xss());

//Prevent parameter pollution
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsAverage',
        'ratingsQuantaity',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

//Serving static files
app.use(express.static(`${__dirname}/public`));//looking for static files - if we dont find any routes that match the app will go to /public and look for static files

//Test middleware
app.use((req, res, next) => {//middleware
    req.requestTime = new Date().toISOString();//the time the request was made
    console.log(req.headers);
    next();
});

//3) ROUTES - mount our routers
app.use('/api/v1/tours', tourRouter);//using the middleware
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//Unhandeld routes
app.all('*', (req, res, next) => {
    next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
    //if next() recive an argument express handle it's an error -> skip all the middleware in the stack
});

//Error handeling middleware
app.use(globalErrorHandler);

//4)SERVER
module.exports = app;

