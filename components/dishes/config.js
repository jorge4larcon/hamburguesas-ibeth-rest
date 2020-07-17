const path = require("path");

UPLOADS_DIR = path.join(__dirname, "uploads/");

const MIN_DISHES = 0;
const MAX_DISHES = 10;

module.exports = {
  UPLOADS_DIR,
  MIN_DISHES,
  MAX_DISHES,
};
