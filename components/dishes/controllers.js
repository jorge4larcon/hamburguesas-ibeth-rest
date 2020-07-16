const validator = require("validator");
const debug = require("debug")("hamburguesas-ibeth-rest:server");
const Dish = require("./dish");
const { AppError } = require("../app-error");
const helpers = require("../helpers");
const httpCodes = require("../http-codes");
const multer = require("multer");
const config = require("./config");

async function sanitizeInputForList(req, res, next) {
  let name = req.query.name || "";
  let category = req.query.category || "";

  if (3 > name.length || name.length > 50) {
    throw AppError.inputError("Invalid value for name field");
  }

  if (3 > category.length || category.length > 50) {
    throw AppError.inputError("Invalid value for category field");
  }

  req.query.name = name;
  req.query.category = category;
  next();
}

sanitizeInputForList = helpers.wrapAsync(sanitizeInputForList);

async function list(req, res, next) {
  let { name, category } = req.query;
  let dishes = await Dish.find({
    name: { $regex: name },
    category: { $regex: category },
  }).exec();
  res.status(httpCodes.ok).json(helpers.successfulResponse({ dishes }));
}

list = helpers.wrapAsync(list);

async function sanitizeInputForCreate(req, res, next) {
  let name = req.body.name || "";
  let description = req.body.description || "";
  let price = req.body.price || "";
  let category = req.body.category || "";

  name = name.trim();
  description = description.trim();
  price = price.trim();
  category = category.trim();

  if (3 > name.length || name.length > 50) {
    throw AppError.inputError("Invalid value for name field");
  }

  if (description.length > 255) {
    throw AppError.inputError("Invalid value for description field");
  }

  if (!validator.isDecimal(price, { decimal_digits: "2,", locale: "en-US" })) {
    throw AppError.inputError("Invalid value for price field");
  }

  price = Number(price);
  if (price < 0) {
    throw AppError.inputError("Invalid value for price field");
  }

  if (3 > category.length || category.length > 50) {
    throw AppError.inputError("Invalid value for category field");
  }

  req.body.name = name;
  req.body.description = description;
  req.body.price = price;
  req.body.category = category;
  next();
}

sanitizeInputForCreate = helpers.wrapAsync(sanitizeInputForCreate);

async function create(req, res, next) {
  let { name, description, price, category } = req.body;
  let imgMimeType = "";
  let imgPath = "";
  if (req.file) {
    imgMimeType = req.file.mimetype;
    imgPath = req.file.path;
  }

  let newDish = new Dish({
    name,
    description,
    price,
    category,
    imgPath,
    imgMimeType,
  });

  try {
    let createdDish = await newDish.save();
    let uid = createdDish.id;
    res.status(httpCodes.ok).json(helpers.successfulResponse({ uid }));
  } catch (error) {
    if (error.name === "MongoError" && error.code === 11000) {
      throw AppError.inputError("This name has already been registered");
    }
  }
}

create = helpers.wrapAsync(create);

const multerOptions = {
  dest: config.UPLOADS_DIR,
  fileFilter: helpers.multerImgFileFilter,
  limits: {
    fileSize: 1024 * 1024,
  },
};

let uploadImg = multer(multerOptions).single("img");

function destroy(req, res, next) {}

function update(req, res, next) {}

module.exports = {
  list,
  sanitizeInputForList,
  create,
  sanitizeInputForCreate,
  uploadImg,
  destroy,
  update,
};
