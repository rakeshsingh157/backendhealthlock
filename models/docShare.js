const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // UUID generate karne ke liye

const docShareSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuidv4() }, // Auto-generated unique sentId
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    patientId: { type: String, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    shareDate: { type: Date, default: Date.now },
    lastAccessed: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("docShare", docShareSchema);
