const User = require("../models/user");
const bcrypt = require("bcrypt");
const { sign } = require("../utils/jwtHelper");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "da9pm6mhw",
  api_key: "239664568437982",
  api_secret: "g-PLRJEpkZ6zy1k_ifyGF-rt8Zk",
});

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
    console.error(`Error creating the user: ${error}`);
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
    console.error(`Error logging the user: ${error}`);
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
      "about",
      "_id",
    ]);

    res.status(200).json(allUsers);
  } catch (error) {
    next(error);
  }
};

const editUser = async (req, res, next) => {
  try {
    const { username, email, name, about } = req.body;

    // Find the current user by their username
    const currentUser = await User.findOne({ username });

    // Update the user's properties with the data from the request
    if (email) {
      currentUser.email = email;
    }
    if (name) {
      currentUser.name = name;
    }
    if (about) {
      currentUser.about = about;
    }
    if (req.file) {
      // If an avatar file was uploaded
      const result = await cloudinary.uploader.upload(req.file.path); // Upload the image to Cloudinary
      currentUser.avatar = result.secure_url; // Assign the secure URL to the avatar field
    }

    await currentUser.save();

    res.status(200).json({
      message: "Information updated successfully",
      status: true,
      user: currentUser,
    });
  } catch (error) {
    next(error);
    res.status(500).json({
      message: "Error updating the info :(",
      status: false,
    });
    console.error(`Error updating the user: ${error}`);
  }
};

module.exports = { register, editUser, login, getAllUsers };
