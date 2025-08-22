const express = require("express");
const router = express.Router();
const PatientLog = require("../models/patientLog");

// Add new patient log
router.post("/add", async (req, res) => {
  try {
    const { doctorId, doctorName, patientId, fileName } = req.body;

    if (!doctorId || !doctorName || !patientId || !fileName) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newLog = new PatientLog({
      doctorId,
      doctorName,
      patientId,
      fileName
    });

    const savedLog = await newLog.save();
    res.status(200).json({ message: "Patient log stored successfully.", data: savedLog });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error storing patient log." });
  }
});

// Get all logs
router.get("/all", async (req, res) => {
  try {
    const logs = await PatientLog.find().sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching logs." });
  }
});

module.exports = router;
