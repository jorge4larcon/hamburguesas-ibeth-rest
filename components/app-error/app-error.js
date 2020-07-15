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

// class AppError extends Error {
//   constructor(message, name, httpCode, description, isOperational) {
//     super(message);
//     this.name = name;
//     this.httpCode = httpCode;
//     this.description = description;
//     this.isOperational = isOperational;
//   }
// }

module.exports = AppError;
