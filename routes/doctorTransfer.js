const express = require("express");
const router = express.Router();
const DocShare = require("../models/docShare");
const Doctor = require("../models/Doctor");
const UserFile = require("../models/UserFile"); // assume patient files
const nodemailer = require("nodemailer");

// Email transporter setup (Gmail example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com", // tumhara email
    pass: "your-email-password",   // app password recommended
  },
});

// Transfer route
router.post("/transfer/:doctorId/:patientId", async (req, res) => {
  const { doctorId, patientId } = req.params;

  try {
    // 1. Fetch doctor info
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found." });

    // 2. Fetch all files of patient
    const files = await UserFile.find({ userId: patientId });
    if (!files.length) return res.status(404).json({ message: "No files found for this patient." });

    // 3. Transfer files to docShare collection
    const shareDate = new Date();
    const lastAccessed = new Date();
    const docShareDocs = files.map(file => ({
      doctorId: doctorId,
      patientId: patientId,
      fileName: file.fileName,
      fileUrl: file.fileUrl,
      shareDate,
      lastAccessed
    }));

    await DocShare.insertMany(docShareDocs);

    // 4. Delete files from doctor/patient side if needed
    await UserFile.deleteMany({ userId: patientId });

    // 5. Send email to patient
    const mailOptions = {
      from: "your-email@gmail.com",
      to: doctor.email, // ya patient email agar patient model me email hai
      subject: "Your medical files have been transferred",
      text: `Hello, your files have been successfully transferred by Dr. ${doctor.name}. You can now access your files securely.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(200).json({ message: "Files transferred and patient notified successfully.", transferredFiles: docShareDocs });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error during file transfer." });
  }
});

module.exports = router;
