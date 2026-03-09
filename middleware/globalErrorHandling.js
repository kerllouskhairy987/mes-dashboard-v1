/**
 * @desc    send global error for development
 * @params  err, req, res, next
 * @return  err
 */
const sendErrorDev = (err, req, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
  });

/**
 * @desc    send global error for production
 * @params  err, req, res, next
 * @return  err
 */
const sendErrorProd = (err, req, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

/**
 * @desc    global error handling middleware (inside express)
 * @params  err, req, res, next
 * @return  err
 * @access  public
 */
const globalErrorHandling = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else {
    sendErrorProd(err, req, res);
  }
};

module.exports = globalErrorHandling;
