/**
 * Async Handler - Wraps async functions to handle errors
 *
 * This utility function wraps async route handlers to automatically catch
 * any errors and pass them to Express's error handling middleware.
 * This eliminates the need for try-catch blocks in every route handler.
 *
 * @param {Function} fn - The async function to wrap
 * @returns {Function} Express middleware function
 *
 * @example
 * // Instead of:
 * router.get('/users', async (req, res, next) => {
 *   try {
 *     const users = await User.find();
 *     res.json(users);
 *   } catch (error) {
 *     next(error);
 *   }
 * });
 *
 * // You can now write:
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = { asyncHandler };
