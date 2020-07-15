const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let userSchema = new Schema({
  username: {
    type: String,
    required: [true, "`name` is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "`password` is required"],
  },
});

let User = mongoose.model("users", userSchema);

module.exports = User;
