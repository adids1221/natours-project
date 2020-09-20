const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicatedFieldsDB = err => {
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field value: ${value}, please enter another value`;
  return new AppError(message, 400);
}

const handleValidatorErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join(' || ')}`;
  return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invlaid token, please login again', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired, please login again', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; //Internal Server Error
  err.status = err.status || 'error';
  console.log(err)
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //let error = Object.assign(err);
    let error;
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    else if (err.code === 11000) error = handleDuplicatedFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidatorErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
}