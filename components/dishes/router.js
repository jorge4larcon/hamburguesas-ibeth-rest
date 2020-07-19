const express = require("express");
const controllers = require("./controllers");
const config = require("./config");
const auth = require("../auth");

let router = express.Router();

router
  .route("/")
  .get(controllers.sanitizeInputForList, controllers.list)
  .post(
    auth.requireAuth,
    controllers.uploadImg,
    controllers.sanitizeInputForCreate,
    controllers.create
  );

router
  .route("/:id")
  .get(controllers.sanitizeInputForRead, controllers.read)
  .patch(auth.requireAuth, controllers.sanitizeInputForUpdate, controllers.update)
  .delete(auth.requireAuth, controllers.sanitizeInputForDestroy, controllers.destroy);

router
  .route("/:id/img")
  .get(controllers.downloadImage)
  .put(auth.requireAuth, controllers.uploadImg, controllers.replaceImage)
  .delete(auth.requireAuth, controllers.destroyImage);

module.exports = router;
