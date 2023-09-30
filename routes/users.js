var express = require("express");
const {
  register,
  check,
  login,
  getAllUsers,
} = require("../controllers/userController");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/register", register);
router.post("/login", login);
router.get("/users/:id", getAllUsers);
router.post("/check", check);

module.exports = router;
