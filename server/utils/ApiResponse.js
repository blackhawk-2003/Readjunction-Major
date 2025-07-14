/**
 * API Response Class - Standardized API response structure
 *
 * Provides a consistent structure for successful API responses
 * with status codes, data, and messages.
 */
class ApiResponse {
  /**
   * Create a new API Response
   * @param {number} statusCode - HTTP status code
   * @param {any} data - Response data
   * @param {string} message - Success message
   */
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

module.exports = { ApiResponse };
