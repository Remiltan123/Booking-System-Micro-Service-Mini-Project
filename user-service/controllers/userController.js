const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getChannel } = require("../config/rabbitmq");
const crypto = require("crypto");

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const publishUserEvent = async (event) => {
  try {
    const channel = getChannel();

    if (!channel) {
      console.warn("RabbitMQ channel not available. User event was not queued.");
      return;
    }

    const queue = "user_events_queue";
    await channel.assertQueue(queue, { durable: true });

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(event)), { persistent: true });
  } catch (error) {
    console.error("Failed to queue user event:", error.message);
  }
};

// REGISTER
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    await publishUserEvent({
      type: "USER_REGISTERED",
      email: user.email,
      subject: "Welcome to TicketMaster",
      userId: user._id,
      name: user.name,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      message: "User registered successfully",
    });

  } catch (error) {
    res.status(500).json({  message: "Server error" , error: error.message, });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        message: "Login successful",
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }

  } catch (error) {
    res.status(500).json({ message: "Server error" , error: error.message,  });
  }
};

// GET USER PROFILE (Protected)
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id; 
    const user = await User.findById(userId).select("-password"); 

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" , error: error.message, });
  }
};

// UPDATE USER PROFILE BY ID (Protected)
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();

    await publishUserEvent({
      type: "PROFILE_UPDATED",
      email: updatedUser.email,
      subject: "Profile Updated",
      userId: updatedUser._id,
      name: updatedUser.name,
    });

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      message: "User profile updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({  message: "Server error" , error: error.message, });
  }
};



exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Send message to RabbitMQ
    const channel = getChannel();
    const queue = "forgot_passwordemail_queue";

    await channel.assertQueue(queue, { durable: true });

      channel.sendToQueue(
      queue,
      Buffer.from(
        JSON.stringify({
          type: "FORGOT_PASSWORD",
          email: user.email,
          subject: "Password Reset Request",
          resetToken,
          frontendUrl: process.env.FRONTEND_URL,
        })
      ),
      { persistent: true }
    );

    res.status(200).json({ message: "Reset email queued" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

