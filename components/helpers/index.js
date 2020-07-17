const path = require("path");
const { AppError } = require("../app-error");

function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}

function successfulResponse(data) {
  return { ok: true, ...data };
}

function successfulResponseMsg(msg) {
  return { ok: true, msg };
}

function multerImgFileFilter(req, file, callback) {
  let ext = path.extname(file.originalname);
  if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
    return callback(
      AppError.inputError("Only images area allowded (jpg, gif, png & jpeg)")
    );
  }
  callback(null, true);
}

module.exports = {
  wrapAsync,
  successfulResponse,
  multerImgFileFilter,
  successfulResponseMsg,
};
