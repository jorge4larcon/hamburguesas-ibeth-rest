const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const debug = require("debug")("hamburguesas-ibeth-rest:server");

const { AppError } = require("../app-error");
const httpCodes = require('../http-codes');
const { User } = require("../users");

const SECRET = process.env.SECRET;
const EXPIRES_IN = process.env.TOKEN_EXPIRATION;

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);

function getToken(user) {
  let payload = { userId: user.id };
  let options = { expiresIn: EXPIRES_IN };
  return jwt.sign(payload, SECRET, options);
}

async function findUserByCredentials(username, password) {
  try {
    let user = await User.findOne({ username }).exec();
    if (await bcrypt.compare(password, user.password)) {
      return user;
    } else {
      return null;
    }
  } catch (error) {
    throw new AppError(
      "Internal error",
      httpCodes.internalServerError,
      "An error has ocurred, please try again later",
      false
    );
  }
}

module.exports = { getToken, findUserByCredentials };
