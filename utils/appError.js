class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        // stack trace || err.stack => where the error happend || (current object, The class)
        // this function call will not be in the stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;