const axios = require("axios");
const FormData = require("form-data");

async function extractTextFromURL(fileUrl) {
  try {
    const form = new FormData();
    form.append("url", fileUrl);
    form.append("apikey", "K86971701888957"); // Tumhari free key
    form.append("language", "eng");
    form.append("isTable", "false"); // Table / form parsing
    form.append("detectOrientation", "false");

    const response = await axios.post("https://api.ocr.space/parse/image", form, {
      headers: form.getHeaders()
    });

    const result = response.data;

    if (result.ParsedResults && result.ParsedResults.length > 0) {
      // OCR text aur tables
      return {
        text: result.ParsedResults[0].ParsedText,
        tables: result.ParsedResults[0].TextOverlay // Table/form info
      };
    } else {
      throw new Error("OCR failed or no parsed results");
    }
  } catch (err) {
    console.error("OCR.Space API error:", err);
    throw err;
  }
}

module.exports = { extractTextFromURL };
