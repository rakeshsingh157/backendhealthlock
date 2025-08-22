const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const medicalDataSchema = new mongoose.Schema({
  userFileId: { type: String, default: uuidv4 }, // 👈 ab random UUID generate hoga
  userId: { type: String, required: true },
  fileUrl: { type: String, required: true },
  ocrText: { type: mongoose.Schema.Types.Mixed, required: true },
  medicalEntities: { type: Array },  // AWS Comprehend Medical ka output
  analysisDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MedicalData", medicalDataSchema);
