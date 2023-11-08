const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const ModalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 30,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    maxLength: 20,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxLength: 50,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  about: {
    type: String,
    maxLength: 2000,
  },
  avatar: String,
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isEmailConfirmed: {
    type: Boolean,
    default: false,
  },
});

ModalSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, 8);
  }
  next();
});

ModalSchema.methods.getData = function () {
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    about: this.about,
    avatar: this.avatar,
  };
};

ModalSchema.methods.signJwt = function () {
  let data = this.getData();

  data.token = jwt.sign(data, process.env.JWT_SECRET);
  return data;
};



module.exports = mongoose.model("User", ModalSchema);
