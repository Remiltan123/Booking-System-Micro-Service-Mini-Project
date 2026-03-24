const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
// const authLimiter = require("../middleware/rateLimiter");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getuser/:id", protect, getUserProfile);
router.put("/updateuser/:id", protect, updateUserProfile);

module.exports = router;