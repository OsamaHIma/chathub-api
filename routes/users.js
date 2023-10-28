var express = require("express");
const multer = require("multer");
const path = require("path");

// Set up multer storage configuration
const storage = multer.diskStorage({
  // destination: function (req, file, cb) {
    // Set the destination folder for avatar uploads
    // cb(null, path.join(__dirname, "../uploads"));
  // },
  filename: function (req, file, cb) {
    // Preserve the original file extension
    const fileExtension = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + fileExtension);
  },
});

// Create the multer instance with the storage configuration
const upload = multer({ storage });

const {
  register,
  editUser,
  login,
  getAllUsers,
  confirmEmail,
  forgotPassword,
  resetPassword,
  google
} = require("../controllers/userController");
var router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", google);

router.get("/confirm-email/:id", confirmEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/users/:id", getAllUsers);
router.post("/edit_user", upload.single("avatar"), editUser);

router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

module.exports = router;
