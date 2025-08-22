const MedicalData = require("../models/MedicalData");
const { extractTextFromURL } = require("../services/ocrService");
const { analyzeMedicalText } = require("../services/awsService");

// Analyze OCR + Medical entities for a given file URL and user
async function analyzeFileByURL({ fileUrl, userId }) {
  try {
    if (!fileUrl || !userId) {
      throw new Error("fileUrl and userId required");
    }

    // 1. OCR
    const ocrText = await extractTextFromURL(fileUrl);

    // 2. AWS Comprehend Medical
    const entities = await analyzeMedicalText(ocrText);

    // 3. Save in MedicalData
    const medicalData = new MedicalData({
      userFileId: null,
      userId,
      fileUrl,
      ocrText,
      medicalEntities: entities
    });
    await medicalData.save();

    return medicalData;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

module.exports = { analyzeFileByURL };
