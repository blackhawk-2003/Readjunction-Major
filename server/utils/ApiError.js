/**
 * API Error Class - Custom error class for API responses
 *
 * Extends the built-in Error class to provide consistent error handling
 * with HTTP status codes and additional properties for API responses.
 *
 * @extends Error
 */
class ApiError extends Error {
  /**
   * Create a new API Error
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {Array} errors - Array of validation errors (optional)
   * @param {string} stack - Error stack trace (optional)
   */
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = { ApiError };
