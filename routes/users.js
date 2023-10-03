var express = require("express");
const {
  register,
  check,
  login,
  getAllUsers,
} = require("../controllers/userController");
var router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users/:id", getAllUsers);
router.post("/check", check);

module.exports = router;
