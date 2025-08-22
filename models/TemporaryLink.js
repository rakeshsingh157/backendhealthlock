const mongoose = require("mongoose");

const temporaryLinkSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId:{type: String, required: true},
  fileName: {type: String, required: true},
  fileUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true } // 5 minute expiry
});

// TTL index for automatic cleanup
temporaryLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("TemporaryLink", temporaryLinkSchema);
