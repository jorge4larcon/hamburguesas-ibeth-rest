const debug = require("debug")("hamburguesas-ibeth-rest:server");
const AppError = require("./app-error");

function handleError(error) {
  debug(error);
  switch (error.name) {
    case "Unknown error":
    case "Internal server error":
    case "MongooseError":
      debug(error.stack);
      return AppError.internalServerError("Internal server error");

    case "Input error":
    case "Database error":
    case "Not found error":
    case "Gone error":
    case "File system error":
      return error;

    case "Authorization error":
      return error;

    case "MongooseServerSelectionError":
      return AppError.dbError("Database connection lost, please try again");

    default:
      debug(error.stack);
      return AppError.internalServerError("Internal server error");
  }
}

function errorHandler(error, req, res, next) {
  error = handleError(error);
  res.status(error.httpCode).json({
    ok: false,
    error: error.name,
    description: error.description,
  });
  if (!error.isOperational) {
    process.exit(1);
  }
}

function notFoundHandler(req, res, next) {
  next(AppError.notFound("Route not found"));
}

module.exports = { errorHandler, notFoundHandler };
