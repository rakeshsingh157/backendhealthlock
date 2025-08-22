const mongoose = require("mongoose");

const patientLogSchema = new mongoose.Schema({
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  patientId: { type: String, required: true },
  fileName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  time: { type: String, default: () => new Date().toLocaleTimeString() }
}, { timestamps: true });

module.exports = mongoose.model("PatientLog", patientLogSchema);
