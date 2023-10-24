const User = require("../models/user");
const bcrypt = require("bcrypt");
const { sign } = require("../utils/jwtHelper");
const Sib = require("sib-api-v3-sdk");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "da9pm6mhw",
  api_key: "239664568437982",
  api_secret: "g-PLRJEpkZ6zy1k_ifyGF-rt8Zk",
});

const defaultClient = Sib.ApiClient.instance;

const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.API_KEY;
const transEmailApi = new Sib.TransactionalEmailsApi();
const sender = {
  email: "osamahima018@gmail.com",
};

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
    const receivers = [
      {
        email,
      },
    ];
    await transEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Please confirm your email address",
      textContent: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      </head>
      <body style="font-family: 'Poppins', sans-serif; background-color: #1f2937;">
        <div style="max-width: 28rem; margin: 5rem auto; background-color: #ffffff; box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1); border-radius: 0.25rem; padding: 1.5rem;">
          <a href="https://chathub-web.vercel.app/" style="margin:0 auto;">
            <img src="https://i.ibb.co/sKXw7Vz/logo.png" alt="logo" style="padding: 0.75rem; margin-bottom: 1rem; margin-left: auto; margin-right: auto; width: 10rem; background-color: #1f2937; border-radius: 0.5rem;">
          </a>
          <h2 style="font-size: 1.5rem; text-align: center; margin-bottom: 1.5rem; color: #4F46E5; font-weight: 600;">Email Confirmation</h2>
          <p style="margin-bottom: 1.5rem;">Dear ${name},</p>
          <p style="margin-bottom: 1.5rem;">Thank you for signing up with our website! To complete your registration, please click the button below to confirm your email address.</p>
          <div style="text-align: center;">
            <a href="${process.env.MAIN_HOST_URL}/api/auth/confirm-email/${user._id}" style="background-color: #4F46E5; color: #ffffff; padding: 0.5rem 1rem; border-radius: 0.25rem; text-decoration: none; font-weight: 500; display: inline-block; box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);">Confirm Email</a>
          </div>
          <p style="margin-top: 1.5rem; color: #888888; font-size: 0.875rem;">If you did not create an account on our platform, you can safely ignore this email.</p>
          <p style="margin-top: 1rem;">Thank you,</p>
          <p style="margin-top: 0.25rem;">ChatHub Team</p>
        </div>
      </body>
      </html>`,
    });

    res.status(200).json(user.signJwt());
  } catch (error) {
    console.error(`Error creating the user: ${error}`);
    next(error);
  }
};

const confirmEmail = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Find the user by their ID in the database
    const user = await User.findById(userId);

    if (!user) {
      // User not found, handle the error or show appropriate message
      res.status(404).json({ message: "User not found" });
      return;
    }
    // Update the user's email confirmation status
    user.isEmailConfirmed = true;
    await user.save();

    // You can redirect the user to a confirmation page or send a response indicating successful confirmation
    res.redirect("/email-confirmed");
  } catch (error) {
    // Handle errors
    console.error(`Error confirming email: ${error}`);
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

    if (!user.isEmailConfirmed) {
      res.status(401).json({
        message: "Please verify your email address to continue",
        status: false,
      });
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

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(email);
    const user = await User.findOne({ email });

    if (!user) {
      res.json({ message: "This email doesn't exist", status: false });
      return;
    }
    const receivers = [
      {
        email,
      },
    ];
    await transEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Reset Password",
      textContent: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Poppins', sans-serif; background-color: #222222;">
        <div style="max-width: 28rem; margin: 5rem auto; background-color: #ffffff; box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1); border-radius: 0.7rem; padding: 1.5rem;">
          <a href="https://chathub-web.vercel.app/">
            <img src="https://i.ibb.co/sKXw7Vz/logo.png" alt="logo" style="display: block; width: 10rem; margin: 0 auto 1rem; padding:0.7rem;  border-radius: 0.5rem; background-color: #4F46E5;">
          </a>
          <h2 style="font-size: 1.5rem; color: #4F46E5; text-align: center; margin-bottom: 1.5rem; font-weight: 600;">Reset Password Request</h2>
          <p style="margin-bottom: 1.5rem;">Dear ${user.name},</p>
          <p style="margin-bottom: 1.5rem;">Please click on the button below to proceed with the password reset process:</p>
          <div style="text-align: center;">
            <a href="${process.env.MAIN_HOST_URL}/api/auth/confirm-reset-password/${user._id}" style="display: inline-block; background-color: #4F46E5; color: #ffffff; padding: 0.5rem 1rem; border-radius: 0.25rem; text-decoration: none; text-align: center; font-weight: 500;">Reset Password</a>
          </div>
          <p style="color: #888888; margin-top: 1.5rem; font-size: 0.875rem;">If you did not request this, you can safely ignore this email.</p>
          <p style="margin-top: 1rem; font-weight: 500;">Thank you,</p>
          <p style="margin-top: 0.25rem; font-weight: 500;">ChatHub Team</p>
        </div>
      </body>
      </html>`,
    });

    res.status(200).json({ status: true, user });
  } catch (error) {
    console.error(`Error Resting the password: ${error}`);
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const {  email, password } = req.body;

    // Find the current user by their username
    const currentUser = await User.findOne({ email });

    // Update the user's properties with the data from the request
    if (currentUser) {
      currentUser.password = password;
    }

    await currentUser.save();

    res.status(200).json({
      message: "password updated successfully",
      status: true,
    });
  } catch (error) {
    next(error);
    res.status(500).json({
      message: "Error updating the password :(",
      status: false,
    });
    console.error(`Error updating the password: ${error}`);
  }
}

const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "name",
      "username",
      "avatar",
      "about",
      "isAdmin",
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

module.exports = {
  register,
  editUser,
  login,
  getAllUsers,
  confirmEmail,
  forgotPassword,
  resetPassword
};
