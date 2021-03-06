const ErrorHandler = require('../utils/errorHandler')

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500

  if (process.env.NODE_ENV === 'DEVELOPMENT') {
    let error = { ...err }

    error.message = err.message

    res.status(err.statusCode).json({
      success: false,
      error: err,
      errorMessage: err.message,
      stack: err.stack,
      message: error.message,
    })
  }

  if (process.env.NODE_ENV === 'PRODUCTION') {
    let error = { ...err }

    error.message = err.message

    //Wrong mongoose ObjectID error
    if (err.name === 'CastError') {
      const message = `Resource not found, Invalid ${err.path}`
      error = new ErrorHandler(message, 400)
    }

    //Handling mongoose Validation error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map((value) => value.message)
      error = new ErrorHandler(message, 400)
    }

    //Handling mongoose duplicate key error
    if (err.code === 11000) {
      const message = `Duplicate ${Object.keys(err.keyValue)} entered`
      error = new ErrorHandler(message, 400)
    }

    // Handling wrong JWT error
    if (err.name === 'JsonWebTokenError') {
      const message = 'JSON Web Token is invalid. Try Again!!!'
      error = new ErrorHandler(message, 400)
    }

    // Handling Expired JWT error
    if (err.name === 'TokenExpiredError') {
      const message = 'JSON Web Token is expired. Try Again!!!'
      error = new ErrorHandler(message, 400)
    }

    res.status(err.statusCode).json({
      success: false,
      message: error.message || 'Internal Server Error',
    })
  }
}
