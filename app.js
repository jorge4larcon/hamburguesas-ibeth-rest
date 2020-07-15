const debug = require('debug')('hamburguesas-ibeth-rest:server');
const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const helmet = require("helmet");
const compress = require("compression");
const cors = require("cors");

require("./config/config");

const { usersRouter } = require('./components/users');
const { dishesRouter } = require('./components/dishes');
const { authRouter } = require('./components/auth');
const { errorHandler, notFoundHandler } = require('./components/app-error');

const app = express();

app.use(logger("dev"));
app.use(helmet());
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/dishes", dishesRouter);
app.use("/auth", authRouter);

// catch 404 and forward to error handler
app.use(notFoundHandler);

// error handler
app.use(errorHandler);

// database connection
require("./config/db-connection");

module.exports = app;
