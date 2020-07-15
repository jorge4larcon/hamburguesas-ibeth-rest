const express = require("express");
const controllers = require("./controllers");

let router = express.Router();

router
  .route("/")
  .get(controllers.sanitizeInputForList, controllers.list)
  .post(controllers.create);

module.exports = router;
