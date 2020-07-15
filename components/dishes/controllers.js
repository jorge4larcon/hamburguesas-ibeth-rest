const debug = require("debug")("hamburguesas-ibeth-rest:server");
const Dish = require("./dish");

function list(req, res, next) {
  let body = req.body;
  debug(req.query);

  res.json("Success");
}

function create(req, res, next) {}

function destroy(req, res, next) {}

function update(req, res, next) {}

module.exports = { list, create, destroy, update };
