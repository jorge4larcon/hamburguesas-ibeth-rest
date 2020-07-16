const authRouter = require("./router");
const controllers = require("./controllers");

module.exports = { authRouter, ...controllers };
