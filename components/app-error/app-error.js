const httpCodes = require("../http-codes");

function AppError(name, httpCode, description, isOperational) {
  Error.call(this);
  Error.captureStackTrace(this);
  this.name = name;
  this.httpCode = httpCode;
  this.description = description;
  this.isOperational = isOperational;
}

AppError.prototype = Object.create(Error.prototype);
AppError.prototype.constructor = AppError;

AppError.notFound = function (description) {
  return new AppError("Not found error", httpCodes.notFound, description, true);
};

AppError.dbError = function (description) {
  return new AppError(
    "Database error",
    httpCodes.serviceUnavailable,
    description,
    true
  );
};

AppError.unknownError = function (description) {
  return new AppError("Unknown error", 0, description, false);
};

AppError.internalServerError = function (description) {
  return new AppError(
    "Internal server error",
    httpCodes.internalServerError,
    description,
    false
  );
};

AppError.inputError = function (description) {
  return new AppError("Input error", httpCodes.badRequest, description, true);
};

AppError.authorizationError = function (httpCode, description) {
  return new AppError("Authorization error", httpCode, description, true);
};

AppError.goneError = function (description) {
  return new AppError("Gone error", httpCodes.gone, description, true);
};

AppError.fileError = function (description) {
  return new AppError("File system error", httpCodes.internalServerError, description, true);
};

module.exports = AppError;
