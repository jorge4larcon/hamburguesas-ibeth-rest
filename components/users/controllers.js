const bcrypt = require("bcrypt");
const validator = require("validator");

const debug = require("debug")("hamburguesas-ibeth-rest:server");
const { AppError } = require("../app-error");
const httpCodes = require('../http-codes');

const config = require("./config");

const lib = require("./lib");
const User = require("./user");

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);

async function sanitizeInputForList(req, res, next) {
  let { skip, limit } = req.query;
  const isValid =
    validator.isInt(skip, { min: 0 }) *
    validator.isInt(limit, {
      min: config.MIN_AMOUNT_OF_USERS_TO_RETRIEVE,
      max: config.MAX_AMOUNT_OF_USERS_TO_RETRIEVE,
    });
  if (isValid) {
    req.query.skip = Number(skip);
    req.query.limit = Number(limit);
    next();
  } else {
    next(
      new AppError(
        "Invalid input",
        httpCodes.badRequest,
        "`skip` or `limit` are invalid values",
        true
      )
    );
  }
}

async function list(req, res, next) {
  let { skip, limit } = req.query;
  try {
    let users = await User.find({}).skip(skip).limit(limit).exec();
    res.status(httpCodes.ok).json(users);
  } catch (error) {
    next(
      new AppError(
        "DB error",
        httpCodes.internalServerError,
        "Could not get the response from the database",
        false
      )
    );
  }
}

async function create(req, res, next) {
  let { username, password } = req.body;
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    next(error);
  }

  let newUser = new User({ username, password: hashedPassword });
  try {
    let createdUser = await newUser.save();
    res.json(createdUser);
  } catch (error) {
    next(error);
  }
}

function destroy(req, res, next) {}

function update(req, res, next) {}

module.exports = { list, create, destroy, update, sanitizeInputForList };
