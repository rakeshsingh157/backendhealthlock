const mongoose = require("mongoose");
const moment = require("moment-timezone");

const patientLogSchema = new mongoose.Schema({
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  patientId: { type: String, required: true },
  fileName: { type: String, required: true },
  date: { 
    type: String, 
    default: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD") 
  },
  time: { 
    type: String, 
    default: () => moment().tz("Asia/Kolkata").format("HH:mm:ss") 
  }
}, { timestamps: true });

module.exports = mongoose.model("PatientLog", patientLogSchema);
