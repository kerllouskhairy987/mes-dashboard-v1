/**
 * @desc    API error class (inside express)
 * @params  statusCode, message
 * @return  ApiError
 * @access  public
 * @route   /
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
  }
}

module.exports = ApiError;
