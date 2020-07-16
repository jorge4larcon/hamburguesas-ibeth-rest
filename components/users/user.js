const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let userSchema = new Schema({
  email: {
    type: String,
    required: [true, "`email` is required"],
    unique: true
  },
  password: {
    type: String,
    required: [true, "`password` is required"],
  },
});

// userSchema.path("email").validate(function (value, done) {
//   this.model("User").count({ email: value }, function (err, count) {
//     if (err) {
//       return done(err);
//     }
//     done(!count);
//   });
// }, "Email already exists");

let User = mongoose.model("users", userSchema);

module.exports = User;
