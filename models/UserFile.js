const mongoose = require("mongoose");
function getISTDate() {
  return moment().tz("Asia/Kolkata").toDate();
}
const userFileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  lastAccessed: { type: Date, default: getISTDate},
  uploadedAt: {type: Date, default: getISTDate }
});

module.exports = mongoose.model("UserFile", userFileSchema);
