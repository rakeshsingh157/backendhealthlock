const mongoose = require("mongoose");

const docShareSchema = new mongoose.Schema({
    doctorId: { type: String, required: true },
    patientId: { type: String, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    shareDate: { type: Date, required: true },
    lastAccessed: { type: Date, required: true }
  
  
}, { timestamps: true });

module.exports = mongoose.model("docShare", docShareSchema);

