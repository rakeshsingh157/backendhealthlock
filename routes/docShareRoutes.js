// routes/docShareRoutes.js

const express = require('express');
const router = express.Router();
const DocShare = require('../models/docShare'); // apka model path

// Body parsing ke liye agar app.js me add nahi kiya hai
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Add a new shared document
router.post('/share-file', async (req, res) => {
    try {
        const { doctorId, patientId, fileName, fileUrl } = req.body;

        if (!doctorId || !patientId || !fileName || !fileUrl) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newDoc = new DocShare({
            doctorId,
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

module.exports = router;
