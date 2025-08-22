const mongoose = require("mongoose");

const userFileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  lastAccessed: { type: Date, default: Date.now },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserFile", userFileSchema);
