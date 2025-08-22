const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true }, // Added required
  password: { type: String, required: true }, // Added required
  specialization:{ type: String, required: true }}
  , { timestamps: true }); // Added timestamps

module.exports = mongoose.model("Doctor", doctorSchema);

