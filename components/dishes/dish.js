const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let dishSchema = new Schema({
  name: {
    type: String,
    required: [true, "`name` is required"],
    unique: true,
  },
  price: {
    type: Number,
    required: [true, "`price` is required"],
  },
  description: {
    type: String,
  },
  category: {
    type: String,
  },
  imgPath: {
    type: String,
  },
  imgMimeType: {
    type: String,
  },
  isEnabled: {
    type: Boolean,
    default: true
  }
});

let Dish = mongoose.model("dishes", dishSchema);

module.exports = Dish;
