import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/authmidlleware.js";

const router = express.Router();

// Signup
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashed });
    await newUser.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email); // ← Add this
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email); // ← Add this
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for:", email); // ← Add this
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }   
    );

    res.json({ token, email: user.email });
  } catch (err) {
    console.error("Login error:", err); // ← Add this
    res.status(500).json({ error: err.message });
  }
});

// Protected route (مع middleware)
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ✅ export واحد فقط
export default router;
