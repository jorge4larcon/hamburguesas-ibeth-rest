const express = require("express");
const controllers = require("./controllers");

let router = express.Router();

router
  .route("/")
  .get(controllers.sanitizeInputForList, controllers.list)
  .post(controllers.sanitizeInputForCreate, controllers.create);

module.exports = router;
