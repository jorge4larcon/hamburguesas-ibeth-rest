const User = require('./user');

async function listUsers(skip = 0, limit = 10) {
  return await User.find({}).skip(skip).limit(limit).exec();
}

module.exports = { listUsers };
