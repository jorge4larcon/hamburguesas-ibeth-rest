const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require("bcrypt");
const debug = require("debug")("hamburguesas-ibeth-rest:server");
const httpCodes = require("../http-codes");
const AppError = require("../app-error/app-error");
const { User } = require("../users");
const helpers = require("../helpers");

function getToken(user) {
  let payload = { userId: user.id };
  let options = { expiresIn: process.env.TOKEN_EXPIRATION };
  return jwt.sign(payload, process.env.SECRET, options);
}

async function findUserByCredentials(email, password) {
  let user = await User.findOne({ email }).exec();
  if (!user) {
    return null;
  }

  if (await bcrypt.compare(password, user.password)) {
    return user;
  }
}

async function findUserByToken({ userId }) {
  let user = await User.findById(userId);
  return user;
}

function sanitizeInputForCreateToken(req, res, next) {
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

async function createToken(req, res, next) {
  let { email, password } = req.body;

  let user = await findUserByCredentials(email, password);
  if (!user) {
    throw AppError.authorizationError(
      httpCodes.unprocessableEntity,
      "Login details incorrect"
    );
  }

  let token = getToken(user);
  res.status(httpCodes.created).json(helpers.successfulResponse({ token }));
}

createToken = helpers.wrapAsync(createToken);

// function sanitizeInputForTokenAuth(req, res, next) {
//   let header = req.headers.authorization || "";
//   let [type, token] = header.split(" ");
//   if (type !== "Bearer") {
//     throw AppError.inputError("Only Bearer authentication is supported");
//   }
//   next();
// }

async function tokenAuth(req, res, next) {
  let header = req.headers.authorization || "";
  let [type, token] = header.split(" ");
  if (type !== "Bearer") {
    throw AppError.inputError("Only Bearer authentication is supported");
  }

  let payload;
  try {
    payload = await jwt.verify(token, process.env.SECRET);
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" &&
      error.message === "invalid token"
    ) {
      throw AppError.authorizationError(
        httpCodes.unauthorized,
        "Invalid token"
      );
    }

    if (
      error.name === "JsonWebTokenError" &&
      error.message === "invalid signature"
    ) {
      throw AppError.authorizationError(
        httpCodes.unauthorized,
        "Invalid signature. I'm suspecting of you..."
      );
    }

    if (error.name === "TokenExpiredError" && error.message === "jwt expired") {
      throw AppError.authorizationError(
        httpCodes.unauthorized,
        "Token expired"
      );
    }
    throw error;
  }

  let user = await findUserByToken(payload);
  if (!user) {
    throw AppError.notFound("User not found");
  }
  req.user = { id: user.id };
  // res.status(httpCodes.ok).json(
  //   helpers.successfulResponse({
  //     msg: `Hi ${req.user.id}, it's good to see you`,
  //   })
  // );
  next();
}

tokenAuth = helpers.wrapAsync(tokenAuth);

async function requireAuth(req, res, next) {
  if (!req.user) {
    throw AppError.authorizationError(
      httpCodes.unauthorized,
      "Authentication required"
    );
  }
  next();
}

requireAuth = helpers.wrapAsync(requireAuth);

let enforce = (policy) => (req, res, next) => {
  if (policy(req)) {
    next();
  } else {
    throw AppError.authorizationError(
      httpCodes.forbidden,
      "You are not allowed to do that"
    );
  }
};

enforce = helpers.wrapAsync(enforce);

module.exports = {
  createToken,
  sanitizeInputForCreateToken,
  tokenAuth,
  requireAuth,
  enforce,
};
