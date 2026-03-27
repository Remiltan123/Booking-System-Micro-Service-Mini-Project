const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, forgotPassword } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
// const authLimiter = require("../middleware/rateLimiter");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getuser/:id", protect, getUserProfile);
router.put("/updateuser/:id", protect, updateUserProfile);
router.post("/forgot-password", forgotPassword); 

module.exports = router;