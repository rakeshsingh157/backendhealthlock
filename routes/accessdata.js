const express = require("express");
const router = express.Router();
const UserFile = require("../models/UserFile"); // tumhara schema

// Fetch all uploads for a specific user
router.get("/uploads/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const userFiles = await UserFile.find({ userId }).sort({ uploadedAt: -1 }); // latest first
    if (!userFiles.length) {
      return res.status(404).json({ message: "No uploads found for this user." });
    }
    res.status(200).json({ totalFiles: userFiles.length, files: userFiles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user uploads." });
  }
});

module.exports = router;
