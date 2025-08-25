// models/Record.js
const mongoose = require("mongoose");
const moment = require("moment-timezone");

// hamesha IST time return karega
function getISTDate() {
  return moment().tz("Asia/Kolkata").toDate();
}

const recordSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true }, // Filestack URL
  uploadDate: { type: Date, default: getISTDate }
}, { 
  timestamps: { 
    currentTime: () => getISTDate() // createdAt, updatedAt bhi IST me
  } 
});

const Record = mongoose.model("Record", recordSchema);
module.exports = Record;
