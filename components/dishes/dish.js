const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let dishSchema = new Schema({
  name: {
    type: String,
    required: [true, "`name` is required"],
  },
  price: {
    type: String,
    required: [true, "`password` is required"],
  },
  description: {
    type: String,
  },
  category: {
    type: String,
  },
  img: {
    type: String,
  },
});

let Dish = mongoose.model("dishes", dishSchema);

module.exports = Dish;
