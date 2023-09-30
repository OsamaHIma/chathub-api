require("dotenv").config();
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const expiresIn = process.env.EXPIRES_IN;

exports.sign = (payload) => {
  return jwt.sign(payload, secret);
};

exports.verify = (token) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return false;
  }
};
