const express = require("express");
const controllers = require("./controllers");

let router = express.Router();

router
  .route("/")
  .post(controllers.sanitizeInputForCreateToken, controllers.createToken)
  .get(controllers.tokenAuth);

module.exports = router;
