// models/Record.js

const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // Reference to the patient (from userModel.js) who uploaded
  fileName: { type: String, required: true },
  filePath: { type: String, required: true }, // This will store the Filestack URL
  uploadDate: { type: Date, default: Date.now },
  // Add other relevant fields for health records if needed (e.g., file type, description)
});

const Record = mongoose.model('Record', recordSchema);
module.exports = Record;
