const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser')

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

//setup pug template engines
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//1) GLOBAL MIDDLEWARE
//Serving static files
//looking for static files - if we dont find any routes that match the app will go to /public and look for static files
app.use(express.static(path.join(__dirname, 'public')));

//Set security http headers
app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
            baseUri: ["'self'"],
            fontSrc: ["'self'", 'https:', 'http:', 'data:'],
            scriptSrc: ["'self'", "'unsafe-eval'", 'https:', 'http:', 'blob:'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
        },
    })
);

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
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

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



//Test middleware
app.use((req, res, next) => {//middleware
    req.requestTime = new Date().toISOString();//the time the request was made
    //console.log(req.cookies);
    next();
});

//3) ROUTES - mount our routers
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);//using the middleware
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//Unhandeld routes
app.all('*', (req, res, next) => {
    next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
    //if next() recive an argument express handle it's an error -> skip all the middleware in the stack
});

//Error handeling middleware
app.use(globalErrorHandler);

//4)SERVER
module.exports = app;

