const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const router = express.Router();

// 🔹 Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res.json({ message: "Signup successful" });
  } catch (error) {
    res.status(500).json({ error: "Signup failed" });
  }
});

// 🔹 Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      "secretKey123", // ❌ replace with process.env.JWT_SECRET
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
