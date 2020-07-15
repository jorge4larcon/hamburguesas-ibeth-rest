const express = require("express");
const controllers = require("./controllers");

let router = express.Router();

router.route("/").get(controllers.list);

module.exports = router;
