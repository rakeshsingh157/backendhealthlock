const express = require("express");
const router = express.Router();
const MedicalData = require("../models/MedicalData");
const axios = require("axios");

const apiKey = 'QHw20MxzRN9JU1VQUKdovICaOXPONYz86DXdUiqy';

// OCR text clean karne ka function
function cleanOCRText(input) {
  if (!input) return '';
  if (typeof input === 'object') {
    if (input.text) return input.text.replace(/\[object Object\]/g, '').replace(/\s+/g, ' ').trim();
    return JSON.stringify(input).replace(/\[object Object\]/g, '').replace(/\s+/g, ' ').trim();
  }
  return input.replace(/\[object Object\]/g, '').replace(/\s+/g, ' ').trim();
}

// OCR text ko chunks me todna
function chunkText(text, chunkSize = 3000) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const chunk = text.slice(start, start + chunkSize).trim();
    if (chunk.length > 0) chunks.push(chunk);
    start += chunkSize;
  }
  return chunks;
}

// Cohere API call for detailed predictions
async function callCohereDetailedAPI(chunk) {
  if (!chunk || chunk.trim().length === 0) return 'Empty chunk skipped.';

  try {
    const response = await axios.post(
      'https://api.cohere.ai/v1/chat',
      {
        model: 'command',
        message: 'Analyze this medical report and predict potential future health risks in detail: ' + chunk
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Debug: log the response structure
    console.log('Cohere Detailed API Response:', JSON.stringify(response.data, null, 2));

    // Try different possible response formats
    if (response.data?.generations?.[0]?.text) {
      return response.data.generations[0].text;
    } else if (response.data?.message?.content) {
      return response.data.message.content;
    } else if (response.data?.text) {
      return response.data.text;
    } else if (typeof response.data === 'string') {
      return response.data;
    } else {
      return 'Unexpected response format: ' + JSON.stringify(response.data);
    }
  } catch (error) {
    console.error('Error calling Cohere Detailed API:', error.response?.data || error.message);
    return 'Error analyzing this chunk.';
  }
}

// Cohere API call for short summary
async function callCohereSummaryAPI(text) {
  if (!text || text.trim().length === 0) return 'Empty text.';

  const prompt = `
You are a summarizer. Analyze the following text and give **very short, 1-line future health risks** only.
Do not repeat anything, do not include extra info or your name.
Example: "You may develop diabetes in the future."

${text}
`;

  try {
    const response = await axios.post(
      'https://api.cohere.ai/v1/chat',
      {
        model: 'command',
        message: prompt
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Debug: log the summary response structure
    console.log('Cohere Summary API Response:', JSON.stringify(response.data, null, 2));

    // Try different possible response formats
    if (response.data?.generations?.[0]?.text) {
      return response.data.generations[0].text;
    } else if (response.data?.message?.content) {
      return response.data.message.content;
    } else if (response.data?.text) {
      return response.data.text;
    } else if (typeof response.data === 'string') {
      return response.data;
    } else {
      return 'Unexpected summary format: ' + JSON.stringify(response.data);
    }
  } catch (error) {
    console.error('Error calling Cohere Summary API:', error.response?.data || error.message);
    return 'Error generating summary.';
  }
}

// Test route to verify Cohere API is working
router.get("/test-cohere", async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.cohere.ai/v1/chat',
      {
        model: 'command',
        message: 'Say hello'
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Test API Response:', JSON.stringify(response.data, null, 2));
    res.json({ 
      success: true, 
      response: response.data,
      apiKey: apiKey ? 'Present' : 'Missing'
    });
  } catch (error) {
    console.error('Test API Error:', error.response?.data || error.message);
    res.json({ 
      success: false, 
      error: error.response?.data || error.message,
      apiKey: apiKey ? 'Present' : 'Missing'
    });
  }
});

// Analysis route
router.get("/analyze/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    // 1. Fetch all OCR reports for this user
    const reports = await MedicalData.find({ userId });
    if (!reports.length) return res.status(404).json({ message: "No reports found for this user." });

    // 2. Combine and clean all OCR texts
    const combinedText = reports
      .map(r => cleanOCRText(r.ocrText))
      .filter(t => t.length > 0)
      .join("\n\n");

    if (!combinedText) return res.status(400).json({ message: "No valid text to analyze." });

    // 3. Chunk the text for detailed analysis
    const chunks = chunkText(combinedText);

    // 4. Get detailed predictions chunk by chunk
    const detailedResults = [];
    for (const chunk of chunks) {
      const prediction = await callCohereDetailedAPI(chunk);
      detailedResults.push({ prediction });
    }

    // 5. Combine all detailed predictions and get short summary
    const combinedPredictionText = detailedResults.map(r => r.prediction).join(" ");
    const shortSummary = await callCohereSummaryAPI(combinedPredictionText);

    // 6. Return full JSON response
    res.status(200).json({
      message: "Analysis completed successfully",
      userId,
      totalChunks: chunks.length,
      detailedResults,
      shortSummary
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error analyzing user reports." });
  }
});

module.exports = router;
