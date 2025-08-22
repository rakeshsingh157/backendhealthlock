const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const UserFile = require("../models/UserFile");
const TemporaryLink = require("../models/TemporaryLink");

// Generate temp URL
router.post("/generate-temp-url/:userId/:fileId", async (req, res) => {
  try {
    const { userId, fileId } = req.params;
    const userFile = await UserFile.findOne({ _id: fileId, userId });
    if (!userFile) return res.status(404).json({ message: "File not found" });

    const token = uuidv4();
    const tempLink = new TemporaryLink({
      token,
      userId: userFile.userId,
      fileName: userFile.fileName,
      fileUrl: userFile.fileUrl,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });
    await tempLink.save();

    res.json({ tempUrl: `http://localhost:3000/api/qr/show/${token}`, expiresIn: "5 minutes", fileUrl: userFile.fileUrl, userId: userFile.userId, file: userFile.fileName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Show file in browser
router.get("/show/:token", async (req, res) => {
  try {
    const { token } = req.params;
    console.log("Route hit with token:", token);

    const tempLink = await TemporaryLink.findOne({ token });
    console.log("Temp link found:", tempLink);

    if (!tempLink) return res.status(404).json({ message: "Link not found or expired" });

    // Check expiry
    if (new Date() > tempLink.expiresAt) return res.status(403).json({ message: "Link has expired" });

    // Redirect to Filestack URL
    res.redirect(tempLink.fileUrl);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
