const express = require('express');
const router = express.Router();
const DocShare = require('../models/docShare');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// 1️⃣ Share a new file
router.post('/share-file', async (req, res) => {
    try {
        const { doctorId, doctorName, patientId, fileName, fileUrl } = req.body;

        if (!doctorId || !doctorName || !patientId || !fileName || !fileUrl) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newDoc = new DocShare({
            doctorId,
            doctorName,  // store doctor name
            patientId,
            fileName,
            fileUrl,
            shareDate: new Date(),
            lastAccessed: new Date()
        });

        await newDoc.save();

        res.status(201).json({ message: "File shared successfully", data: newDoc });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// 2️⃣ Get all files for a doctor or patient
router.get('/all-files', async (req, res) => {
    try {
        const { doctorId, patientId } = req.query;

        const query = {};
        if (doctorId) query.doctorId = doctorId;
        if (patientId) query.patientId = patientId;

        const files = await DocShare.find(query).sort({ shareDate: -1 });

        res.status(200).json({ message: "Files fetched successfully", data: files });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// 3️⃣ Delete a shared file by sentId
router.delete('/delete-file/:sentId', async (req, res) => {
    try {
        const sentId = req.params.sentId;

        const deletedDoc = await DocShare.findByIdAndDelete(sentId);

        if (!deletedDoc) {
            return res.status(404).json({ message: "File not found or already deleted" });
        }

        res.status(200).json({ message: "File deleted successfully", data: deletedDoc });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
