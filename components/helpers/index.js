function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}

function successfulResponse(data) {
  return { ok: true, ...data };
}

module.exports = { wrapAsync, successfulResponse };
