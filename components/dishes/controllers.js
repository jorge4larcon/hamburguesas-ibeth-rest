const validator = require("validator");
const debug = require("debug")("hamburguesas-ibeth-rest:server");
const Dish = require("./dish");
const { AppError } = require("../app-error");
const helpers = require("../helpers");
const httpCodes = require("../http-codes");
const multer = require("multer");
const config = require("./config");
const path = require("path");
const { successfulResponseMsg } = require("../helpers");
const fs = require("fs").promises;

async function sanitizeInputForList(req, res, next) {
  let name = req.query.name || "";
  let category = req.query.category || "";
  let skip = req.query.skip || "0";
  let limit = req.query.limit || `${config.MAX_DISHES}`;

  if (!validator.isInt(skip, { min: 0 })) {
    throw AppError.inputError("Invalid value for skip field");
  }

  if (
    !validator.isInt(limit, { min: config.MIN_DISHES, max: config.MAX_DISHES })
  ) {
    throw AppError.inputError("Invalid value for limit field");
  }

  req.query.name = name;
  req.query.category = category;
  req.query.skip = Number(skip);
  req.query.limit = Number(limit);
  next();
}

sanitizeInputForList = helpers.wrapAsync(sanitizeInputForList);

async function list(req, res, next) {
  let { name, category, skip, limit } = req.query;

  let dishes = await Dish.find({
    name: { $regex: name },
    category: { $regex: category },
  })
    .select("id name description price isEnabled category")
    .skip(skip)
    .limit(limit)
    .exec();

  res.status(httpCodes.ok).json(helpers.successfulResponse({ dishes }));
}

list = helpers.wrapAsync(list);

async function downloadImage(req, res, next) {
  let id = req.params.id || "";
  let dish = await Dish.findById(id);
  if (!dish) {
    throw AppError.notFound("Dish not found");
  }

  if (!dish.imgFilename) {
    throw AppError.goneError("This dish has not an image");
  }

  let imgPath = path.join(config.UPLOADS_DIR, dish.imgFilename);
  let imgMimeType = dish.imgMimeType || "";
  let [_, ext] = imgMimeType.split("/");
  let filename = `${dish.name}.${ext}`;

  try {
    await fs.access(imgPath);
    res.status(httpCodes.ok).download(imgPath, filename, (error) => {
      if (error) {
        debug(`Could not send file ${filename} to client ${req.ip}`);
        res
          .status(httpCodes.internalServerError)
          .json(successfulResponseMsg("Sorry, we could not send you the file"));
      }
    });
  } catch (error) {
    throw AppError.goneError("The image does not exist");
  }
}

downloadImage = helpers.wrapAsync(downloadImage);

async function destroyImage(req, res, next) {
  let id = req.params.id || "";
  let dish = await Dish.findById(id);
  if (!dish) {
    throw AppError.notFound("Dish not found");
  }

  if (!dish.imgFilename) {
    throw AppError.goneError("This dish has not an image");
  }

  let imgPath = path.join(config.UPLOADS_DIR, dish.imgFilename);

  try {
    await fs.unlink(imgPath);    
  } catch (error) {
    throw AppError.fileSystemError(
      "Could not delete the file, try again later"
    );
  }

  try {
    dish.imgFilename = "";
    dish.imgMimeType = "";
    await dish.save();
  } catch (error) {
    debug('Could not update the fields imgFilename and imgMimeType after destroying image');
  }

  res.status(httpCodes.ok).json(helpers.successfulResponseMsg('The image has been deleted'));  
}

destroyImage = helpers.wrapAsync(destroyImage);

async function replaceImage(req, res, next) {
  let id = req.params.id || "";
  let dish = await Dish.findById(id);
  if (!dish) {
    throw AppError.notFound("Dish not found");
  }

  let imgMimeType = "";
  let imgFilename = "";
  if (!req.file) {
    throw AppError.inputError('You did not provided a image to replace the current one');
  }
  imgMimeType = req.file.mimetype;
  imgFilename = req.file.filename;
  
  // DELETE THE EXISTING FILE IF EXISTS
  if (dish.imgFilename) {
    let imgPath = path.join(config.UPLOADS_DIR, dish.imgFilename);
    try {
      await fs.unlink(imgPath);    
    } catch (error) {
      throw AppError.fileSystemError(
        "Could not replace the file, try again later"
      );
    }    
  }

  // UPDATE THE DB FIELDS
  try {
    dish.imgFilename = imgFilename;
    dish.imgMimeType = imgMimeType;
    await dish.save();
    res.status(httpCodes.ok).json(helpers.successfulResponseMsg('The image was replaced'))
  } catch (error) {
    debug('Could not update the fields imgFilename and imgMimeType after destroying image');
    throw AppError.dbError('Database field were not updated');
  }
}

replaceImage = helpers.wrapAsync(replaceImage);

async function sanitizeInputForRead(req, res, next) {
  let id = req.params.id || "";
  if (!validator.isMongoId(id)) {
    throw AppError.inputError("Invalid value for route parameter id");
  }

  req.params.id = id;
  next();
}

sanitizeInputForRead = helpers.wrapAsync(sanitizeInputForRead);

async function read(req, res, next) {
  let id = req.params.id;
  let dish = await Dish.findById(
    id,
    "id name description price isEnabled category"
  );
  if (!dish) {
    throw AppError.notFound("Dish not found");
  }
  res.status(httpCodes.ok).json(helpers.successfulResponse({ dish }));
}

read = helpers.wrapAsync(read);

async function sanitizeInputForCreate(req, res, next) {
  let name = req.body.name || "";
  let description = req.body.description || "";
  let price = req.body.price || "";
  let category = req.body.category || "";
  let isEnabled = req.body.isEnabled || "";

  name = name.trim();
  description = description.trim();
  price = price.trim();
  category = category.trim();
  isEnabled = isEnabled.trim();

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

  if (!validator.isBoolean(isEnabled)) {
    throw AppError.inputError("Invalid value for isEnabled field");
  }

  req.body.name = name;
  req.body.description = description;
  req.body.price = price;
  req.body.category = category;
  req.body.isEnabled = isEnabled;
  next();
}

sanitizeInputForCreate = helpers.wrapAsync(sanitizeInputForCreate);

async function create(req, res, next) {
  let { name, description, price, category } = req.body;
  let imgMimeType = "";
  let imgFilename = "";
  if (req.file) {
    imgMimeType = req.file.mimetype;
    imgFilename = req.file.filename;
  }

  let newDish = new Dish({
    name,
    description,
    price,
    category,
    imgFilename,
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

async function sanitizeInputForDestroy(req, res, next) {
  let id = req.params.id || "";
  if (!validator.isMongoId(id)) {
    throw AppError.inputError("Invalid value for route parameter id");
  }
  req.params.id = id;
  next();
}

sanitizeInputForDestroy = helpers.wrapAsync(sanitizeInputForDestroy);

async function destroy(req, res, next) {
  let id = req.params.id;
  let dish = await Dish.findByIdAndDelete(id);
  if (!dish) {
    throw AppError.notFound("Dish not found");
  }
  res.status(httpCodes.ok).json(helpers.successfulResponseMsg("Dish deleted"));
}

destroy = helpers.wrapAsync(destroy);

async function sanitizeInputForUpdate(req, res, next) {
  let id = req.params.id || "";
  if (!validator.isMongoId(id)) {
    throw AppError.inputError("Invalid value for route parameter id");
  }
  req.params.id = id;

  let name = req.body.name;
  if (name) {
    name = name.trim();
    if (3 > name.length || name.length > 50) {
      throw AppError.inputError("Invalid value for name field");
    }
    req.body.name = name;
  }

  let description = req.body.description;
  if (description) {
    description = description.trim();
    if (description.length > 255) {
      throw AppError.inputError("Invalid value for description field");
    }
    req.body.description = description;
  }

  let price = req.body.price;
  if (price) {
    price = price.trim();
    if (
      !validator.isDecimal(price, { decimal_digits: "2,", locale: "en-US" })
    ) {
      throw AppError.inputError("Invalid value for price field");
    }
    price = Number(price);
    if (price < 0) {
      throw AppError.inputError("Invalid value for price field");
    }
    req.body.price = price;
  }

  let category = req.body.category;
  if (category) {
    category = category.trim();
    if (3 > category.length || category.length > 50) {
      throw AppError.inputError("Invalid value for category field");
    }
    req.body.category = category;
  }

  let isEnabled = req.body.isEnabled;
  if (isEnabled) {
    isEnabled = isEnabled.trim();
    if (!validator.isBoolean(isEnabled)) {
      throw AppError.inputError("Invalid value for isEnabled field");
    }
    req.body.isEnabled = isEnabled;
  }

  next();
}

sanitizeInputForUpdate = helpers.wrapAsync(sanitizeInputForUpdate);

async function update(req, res, next) {
  let { name, description, price, category, isEnabled } = req.body;
  let fieldsToUpdate = { name, description, price, category, isEnabled };
  Object.keys(fieldsToUpdate).forEach((key) =>
    fieldsToUpdate[key] === undefined ? delete fieldsToUpdate[key] : {}
  );

  if (Object.entries(fieldsToUpdate).length === 0) {
    throw AppError.inputError("Nothing to update");
  }

  let dish = await Dish.findByIdAndUpdate(req.params.id, fieldsToUpdate);
  if (!dish) {
    throw AppError.notFound("Dish not found");
  }
  res.status(httpCodes.ok).json(helpers.successfulResponseMsg("Dish updated"));
}

update = helpers.wrapAsync(update);

module.exports = {
  list,
  sanitizeInputForList,
  create,
  sanitizeInputForCreate,
  uploadImg,
  destroy,
  sanitizeInputForDestroy,
  update,
  sanitizeInputForUpdate,
  downloadImage,
  destroyImage,
  replaceImage,
  read,
  sanitizeInputForRead,
};
