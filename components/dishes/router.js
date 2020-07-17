const express = require("express");
const controllers = require("./controllers");
const config = require("./config");

let router = express.Router();

router.route("/")
  .get(controllers.sanitizeInputForList, controllers.list)
  .post(
    controllers.uploadImg,
    controllers.sanitizeInputForCreate,
    controllers.create
  );

router.route('/:id')
  .get(controllers.sanitizeInputForRead, controllers.read)
  .patch(controllers.sanitizeInputForUpdate, controllers.update)
  .delete(controllers.sanitizeInputForDestroy, controllers.destroy);

router.route("/:id/img")
  .get(controllers.downloadImage)
  .put(controllers.uploadImg, controllers.replaceImage)
  .delete(controllers.destroyImage);

module.exports = router;
