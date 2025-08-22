const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialization: { type: String, required: true },
  degreeFileUrl: { type: String, required: true }, // uploaded file ka URL
  isVerified: { type: Boolean, default: false },   // admin verify karega
});

module.exports = mongoose.model("Doctor", doctorSchema);
