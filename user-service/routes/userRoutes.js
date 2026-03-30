const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, forgotPassword } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const authLimiter = require("../middleware/rateLimiter");

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter,  loginUser);
router.get("/getuser/:id", protect, getUserProfile);
router.put("/updateuser/:id", protect, updateUserProfile);
router.post("/forgot-password", authLimiter, forgotPassword); 

module.exports = router;