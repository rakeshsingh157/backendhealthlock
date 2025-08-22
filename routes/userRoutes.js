// patientRoutes.js
const express = require("express");
const router = express.Router();
const Patient = require("../models/patientModel");
const bcrypt = require("bcryptjs"); // Import bcryptjs for password comparison
const jwt = require("jsonwebtoken"); // Import jsonwebtoken for token generation

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, age } = req.body;

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new patient document
    const newPatient = new Patient({
      name,
      email,
      password: hashedPassword, 
      age,
    });

    await newPatient.save();
    res.status(201).json({ message: "✅ Patient registered successfully", patient: newPatient });

  } catch (error) {
    res.status(500).json({ error: "❌ Something went wrong", details: error.message });
  }
});

// Patient Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if patient exists by email
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(404).json({ error: "❌ Patient not found" });
    }

    // 2. Compare the entered password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(401).json({ error: "❌ Invalid credentials" });
    }

    const token = jwt.sign(
      { id: patient._id, role: "patient" }, // Payload: includes patient ID and role
      "secretKey123", 
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // 4. Send a success response with the token and patient role
    res.status(200).json({ message: "✅ Login successful", token, role: "patient" });

  } catch (error) {
    console.error("Login error:", error); // Log the full error for debugging
    res.status(500).json({ error: "❌ Something went wrong during login", details: error.message });
  }
});

module.exports = router;
