var express = require("express");
const multer = require("multer");

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination folder for avatar uploads
    cb(null, "../uploads");
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for the uploaded file
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix);
  },
});

// Create the multer instance with the storage configuration
const upload = multer({ storage });

const {
  register,
  editUser,
  login,
  getAllUsers,
} = require("../controllers/userController");
var router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users/:id", getAllUsers);
router.post("/edit_user", upload.single("avatar"), editUser);

module.exports = router;
