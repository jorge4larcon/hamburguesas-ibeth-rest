const express = require("express");
const controllers = require("./controllers");

let router = express.Router();

router.route("/").post(controllers.createToken);

module.exports = router;
