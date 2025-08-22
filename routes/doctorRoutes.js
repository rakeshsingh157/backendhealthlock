const express = require("express");
const router = express.Router();
const Doctor = require("../models/doctorModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const axios = require("axios");

const FILESTACK_KEY = "A3xfbwhHOSe25uFyU1V9Lz";

const upload = multer({ storage: multer.memoryStorage() });

// Doctor Register
router.post("/register", upload.single("degreeFile"), async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "❌ Degree file is required" });
    }

    // Upload file to Filestack
    const fileName = `${Date.now()}-${email}.pdf`; 
    const endpoint = `https://www.filestackapi.com/api/store/S3?key=${FILESTACK_KEY}&filename=${encodeURIComponent(fileName)}`;

    const uploadRes = await axios.post(endpoint, req.file.buffer, {
      headers: { "Content-Type": "application/octet-stream" },
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = new Doctor({
      name,
      email,
      password: hashedPassword,
      specialization,
      degreeFileUrl: uploadRes.data.url,
    });

    await newDoctor.save();

    res.status(201).json({
      message: "✅ Doctor registered, waiting for admin verification",
      doctor: newDoctor,
    });

  } catch (error) {
    res.status(500).json({ error: "❌ Something went wrong", details: error.message });
  }
});
// Doctor Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({ error: "❌ Doctor not found" });
    }

    if (!doctor.isVerified) {
      return res.status(403).json({ error: "⏳ Doctor not verified by admin yet" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ error: "❌ Invalid credentials" });
    }

    const token = jwt.sign(
      { id: doctor._id, role: "doctor", specialization: doctor.specialization },
      "secretKey123",
      { expiresIn: "1h" }
    );

    res.json({
      message: "✅ Doctor logged in successfully",
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization
      }
    });
  } catch (error) {
    res.status(500).json({ error: "❌ Login failed", details: error.message });
  }
});

// Admin verify doctor
router.put("/verify/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: "❌ Doctor not found" });

    doctor.isVerified = true;
    await doctor.save();

    res.json({ message: "✅ Doctor verified successfully", doctor });
  } catch (error) {
    res.status(500).json({ error: "❌ Verification failed", details: error.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const doctors = await Doctor.find({}, "-password"); 
    // password field hide kar diya for security

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error("❌ Error fetching doctors:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching doctors"
    });
  }
});


module.exports = router;
