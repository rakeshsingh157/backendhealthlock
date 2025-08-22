const mongoose = require("mongoose");

const medicalDataSchema = new mongoose.Schema({
  userFileId: { type: mongoose.Schema.Types.ObjectId, ref: "UserFile" }, // original file reference
  userId: { type: String, required: true },
  fileUrl: { type: String, required: true },
  ocrText: { type: mongoose.Schema.Types.Mixed, required: true },
  medicalEntities: { type: Array },  // AWS Comprehend Medical ka output
  analysisDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MedicalData", medicalDataSchema);