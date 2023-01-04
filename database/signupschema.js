const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please enter a username"],
  },
  email: {
    type: String,
    lowercase: true,
    required: [true, "Please enter an email"],

    unique: true,
    validate: [isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter the password"],
    minlength: [6, "Minimum length should be 6 character"],
  },
});

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
})

const User = new mongoose.model("user", userSchema);
module.exports = User;