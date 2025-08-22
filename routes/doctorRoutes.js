
const express = require("express");
const router = express.Router();
const Doctor = require("../models/doctorModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get("/test", (req, res)=>{
return res.send("pass")
})


// Doctor Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = new Doctor({
      name,
      email,
      password: hashedPassword, 
      specialization,
    });

    await newDoctor.save();
    res.status(201).json({ message: "✅ Doctor registered successfully", doctor: newDoctor });

  } catch (error) {
    res.status(500).json({ error: "❌ Something went wrong", details: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({ error: "❌ Doctor not found" });
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



module.exports = router;

