const debug = require("debug")("hamburguesas-ibeth-rest:server");

const httpCodes = require('../http-codes');
const { findUserByCredentials, getToken } = require("./lib");

async function createToken(req, res, next) {
  let { username, password } = req.body;
  try {
    debug('All is well')
    let user = await findUserByCredentials(username, password);
    debug('All is well')
    let token = getToken(user);
    debug('All is well')
    res.status(httpCodes.ok).json({ token });
    debug('All is well')
  } catch (error) {
    debug('All is NOT well')
    next(error);
  }
}

module.exports = { createToken };
