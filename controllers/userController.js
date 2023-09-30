const User = require("../models/user");
const bcrypt = require("bcrypt");
const { sign } = require("../utils/jwtHelper");

const register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
      res.status(409).json({ message: "Username already used", status: false });
      return;
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(409).json({ message: "Email already used", status: false });
      return;
    }

    const user = await User.create({
      username,
      name,
      email,
      password,
    });

    res.status(200).json(user.signJwt());
  } catch (error) {
    console.log(`Error creating the user: ${error}`);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Incorrect Email or password", status: false });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Incorrect Email or password", status: false });
      return;
    }

    delete user.password;
    res.status(200).json({ status: true, token: sign({ sub: user._id }), user });
  } catch (error) {
    console.log(`Error logging the user: ${error}`);
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "name",
      "username",
      "avatar",
      "_id",
    ]);

    res.status(200).json(allUsers);
  } catch (error) {
    next(error);
  }
};

const check = async (req, res, next) => {
  try {
    const { username, email } = req.body;

    if (username) {
      const userExists = await User.findOne({ username });
      if (userExists)
        res.json({ message: "Username already used", status: false });
    }

    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists)
        return res.json({ message: "Email already used", status: false });
    }
  } catch (error) {
    next(error);
    console.log(`Error creating the user: ${error}`);
  }
};

module.exports = { register, check, login,getAllUsers };
