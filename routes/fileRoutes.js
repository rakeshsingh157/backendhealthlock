const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const UserFile = require("../models/UserFile");
const { analyzeFileByURL } = require("../controls/analyzeController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const FILESTACK_KEY = "A3xfbwhHOSe25uFyU1V9Lz";

// ✅ Upload File
router.post("/upload/:userId", upload.single("file"), async (req, res) => {
  try {
    const userId = req.params.userId;
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    const endpoint = `https://www.filestackapi.com/api/store/S3?key=${FILESTACK_KEY}&filename=${encodeURIComponent(fileName)}`;

    const response = await axios.post(endpoint, fs.createReadStream(filePath), {
      headers: { "Content-Type": req.file.mimetype }
    });

    fs.unlinkSync(filePath);

    const newFile = new UserFile({
      userId,
      fileName,
      fileUrl: response.data.url
    });

    const analysis = await analyzeFileByURL({ fileUrl: newFile.fileUrl, userId });
    await newFile.save();

    res.json({ message: "✅ File uploaded & stored", file: newFile, analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get User Files
router.get("/files/:userId", async (req, res) => {
  try {
    const files = await UserFile.find({ userId: req.params.userId }).populate("userId", "name email");
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
