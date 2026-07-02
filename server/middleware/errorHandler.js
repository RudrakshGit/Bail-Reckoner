/**
 * Global Express error-handling middleware.
 *
 * Catches any error that is thrown or passed via next(err) in route handlers
 * and returns a consistent JSON response.
 */
const errorHandler = (err, _req, res, _next) => {
  // Mongoose bad ObjectId / invalid query value
  if (err.name === "CastError") {
    return res.status(400).json({
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      message: "Validation failed",
      details: messages,
    });
  }

  // Mongoose duplicate-key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(", ");
    return res.status(409).json({
      message: `Duplicate value for: ${field}`,
    });
  }

  // Default to 500
  const statusCode = err.statusCode || 500;
  console.error("[ERROR]", err.message, ...(process.env.NODE_ENV !== "production" ? [err.stack] : []));

  res.status(statusCode).json({
    message: statusCode === 500 ? "Internal Server Error" : err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
