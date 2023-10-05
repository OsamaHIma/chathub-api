const User = require("../models/user");
const bcrypt = require("bcrypt");
const { sign } = require("../utils/jwtHelper");

const register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
      res.json({ message: "Username already used", status: false });
      return;
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.json({ message: "Email already used", status: false });
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
      res
        .status(401)
        .json({ message: "Incorrect Email or password", status: false });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res
        .status(401)
        .json({ message: "Incorrect Email or password", status: false });
      return;
    }

    delete user.password;
    res
      .status(200)
      .json({ status: true, token: sign({ sub: user._id }), user });
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

const editUser = async (req, res, next) => {
  try {
    const { username, email, name, password } = req.body;

    // Find the current user by their username
    const currentUser = await User.findOne({ username });
    console.log(currentUser);
    // Update the user's properties with the data from the request
    currentUser.email = email;
    currentUser.name = name;
    currentUser.password = password;
    currentUser.isAvatarImageSet = true;

    // // Handle the avatar upload using the multer middleware
    // (req, res, async (err) => {
    //   if (err) {
    //     // Handle any upload errors
    //     console.log("Error uploading avatar:", err);
    //     return res.status(400).json({ message: "Error uploading avatar" });
    //   }

    //   // Access the uploaded file from req.file if available
    //   if (req.file) {
    //     currentUser.avatar = req.file.path; // Save the file path to the user's avatar field
    //   }

    // Save the updated user
    await currentUser.save();

    res.status(200).json({
      message: "User updated successfully",
      status: true,
      user: currentUser.getData(),
    });
    // });
  } catch (error) {
    next(error);
    console.log(`Error updating the user: ${error}`);
  }
};

module.exports = { register, editUser, login, getAllUsers };
