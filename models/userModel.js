const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Added required
  email: { type: String, unique: true, required: true }, // Added required
  password: { type: String, required: true }, // Added required
  role: { type: String, enum: ["patient", "doctor"], required: true }
}, { timestamps: true }); // Added timestamps

module.exports = mongoose.model("User", userSchema);

