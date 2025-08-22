const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// MongoDB Schema
const medicalDataSchema = new mongoose.Schema({
  userFileId: { type: mongoose.Schema.Types.ObjectId, ref: "UserFile" },
  userId: { type: String, required: true },
  fileUrl: { type: String, required: true },
  ocrText: { type: String, required: true },
  medicalEntities: { type: Array },
  analysisDate: { type: Date, default: Date.now }
});

const MedicalData = mongoose.model('MedicalData', medicalDataSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/medicalDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Cohere API configuration
const COHERE_API_KEY = 'QHw20MxzRN9JU1VQUKdovICaOXPONYz86DXdUiqy';
const COHERE_API_URL = 'https://api.cohere.ai/v1/chat';

// Utility function to split text into chunks
function splitTextIntoChunks(text, maxChunkSize = 4000) {
  const chunks = [];
  const sentences = text.split('. ');
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize) {
      chunks.push(currentChunk);
      currentChunk = sentence + '. ';
    } else {
      currentChunk += sentence + '. ';
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

// Function to analyze medical text with Cohere
async function analyzeMedicalText(text) {
  try {
    const chunks = splitTextIntoChunks(text);
    let fullAnalysis = '';
    
    for (const chunk of chunks) {
      const response = await axios.post(COHERE_API_URL, {
        model: 'command',
        message: `Analyze this medical text and provide health insights and future predictions: ${chunk}`,
        max_tokens: 1000,
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      fullAnalysis += response.data.text + '\n\n';
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return fullAnalysis;
  } catch (error) {
    console.error('Error calling Cohere API:', error.response?.data || error.message);
    throw new Error('Failed to analyze medical text');
  }
}

// Routes
app.get('/', async (req, res) => {
  try {
    const medicalRecords = await MedicalData.find().limit(10).sort({ analysisDate: -1 });
    res.render('index', { medicalRecords, analysisResult: null, error: null });
  } catch (error) {
    res.render('index', { medicalRecords: [], analysisResult: null, error: 'Failed to fetch medical records' });
  }
});

app.post('/analyze/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Fetch all OCR texts for the user
    const medicalRecords = await MedicalData.find({ userId });
    
    if (medicalRecords.length === 0) {
      return res.status(404).json({ error: 'No medical records found for this user' });
    }
    
    // Combine all OCR texts
    const combinedText = medicalRecords.map(record => record.ocrText).join('\n\n');
    
    // Analyze with Cohere
    const analysisResult = await analyzeMedicalText(combinedText);
    
    // Update the latest medical record with the analysis
    const latestRecord = medicalRecords[0];
    latestRecord.medicalEntities = latestRecord.medicalEntities || [];
    latestRecord.medicalEntities.push({
      type: 'cohere_analysis',
      text: analysisResult,
      date: new Date()
    });
    
    await latestRecord.save();
    
    res.json({ analysisResult });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const medicalRecords = await MedicalData.find({ userId }).sort({ analysisDate: -1 });
    
    if (medicalRecords.length === 0) {
      return res.render('user', { 
        medicalRecords: [], 
        userId, 
        error: 'No medical records found for this user' 
      });
    }
    
    res.render('user', { medicalRecords, userId, error: null });
  } catch (error) {
    res.render('user', { 
      medicalRecords: [], 
      userId: req.params.userId, 
      error: 'Failed to fetch user records' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});