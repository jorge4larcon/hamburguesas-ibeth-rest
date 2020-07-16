const bcrypt = require("bcrypt");
const validator = require("validator");
const config = require("./config");
const debug = require("debug")("hamburguesas-ibeth-rest:server");
const helpers = require("../helpers");
const httpCodes = require("../http-codes");
const User = require("./user");
const { AppError } = require("../app-error");
const { wrapAsync } = require("../helpers");

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);

async function sanitizeInputForList(req, res, next) {
  let skip = req.query.skip || "";
  let limit = req.query.limit || "";

  if (!validator.isInt(skip, { min: 0 })) {
    throw AppError.inputError("Invalid value for skip field");
  }

  if (
    !validator.isInt(limit, { min: config.MIN_USERS, max: config.MAX_USERS })
  ) {
    throw AppError.inputError("Invalid value for limit field");
  }

  req.query.skip = Number(skip);
  req.query.limit = Number(limit);
  next();
}

sanitizeInputForList = helpers.wrapAsync(sanitizeInputForList);

async function list(req, res, next) {
  let { skip, limit } = req.query;
  let users = await User.find({}).skip(skip).limit(limit).exec();
  res.status(httpCodes.ok).json(helpers.successfulResponse({ users }));
}

list = helpers.wrapAsync(list);

async function sanitizeInputForCreate(req, res, next) {
  let email = req.body.email || "";
  let password = req.body.password || "";

  if (!validator.isEmail(email)) {
    throw AppError.inputError("Invalid value for email field");
  }

  if (!validator.isNumeric(password) || password.length !== 6) {
    throw AppError.inputError("Invalid value for password field");
  }

  req.body.email = email;
  req.body.password = password;
  next();
}

sanitizeInputForCreate = helpers.wrapAsync(sanitizeInputForCreate);

async function create(req, res, next) {
  let { email, password } = req.body;
  let hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  let newUser = new User({ email, password: hashedPassword });
  try {
    let createdUser = await newUser.save();
    let uid = createdUser.id;
    res.status(httpCodes.ok).json(helpers.successfulResponse({ uid }));
  } catch (error) {
    if (error.name === "MongoError" && error.code === 11000) {
      throw AppError.inputError("This email has already been registered");
    }
  }
}

create = helpers.wrapAsync(create);

function destroy(req, res, next) {}

function update(req, res, next) {}

module.exports = {
  list,
  sanitizeInputForList,
  create,
  sanitizeInputForCreate,
  destroy,
  update,
};
