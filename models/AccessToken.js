// models/AccessToken.js

const mongoose = require('mongoose');

const accessTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true }, // The unique token string for the QR code
  record: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Record' }, // Reference to the record it grants access to
  expiresAt: { type: Date, required: true }, // When the token expires
  permissions: [{ type: String }], // e.g., ['read-only'], ['full-access']
  grantedBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // The user (patient) who generated this token
});

const AccessToken = mongoose.model('AccessToken', accessTokenSchema);
module.exports = AccessToken;
