const debug = require("debug")("hamburguesas-ibeth-rest:server");
const AppError = require("./app-error");
const httpCodes = require("../http-codes");

function handleError(error) {
  debug("An error has ocurred");
  debug(error.name);
}

function errorHandler(error, req, res, next) {
  handleError(error);
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
  let error = new AppError(
    "Not Found",
    httpCodes.notFound,
    "Route not found",
    true
  );
  next(error);
}

module.exports = { errorHandler, notFoundHandler };
