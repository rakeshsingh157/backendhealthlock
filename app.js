const express = require('express');
const cors = require('cors');
const { CohereClient } = require('cohere-ai');
require('dotenv').config();

const router = express.Router();

// Initialize Cohere client
const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

// Middleware for this router
router.use(cors());
router.use(express.json());

// Store conversation history
let conversationHistory = [];

// Define system prompt
const systemPrompt = `You are a medical and wellness information chatbot named HealthLock AI. Your purpose is to provide general, factual information on drugs, nutrition, sleep, and overall wellness. You are NOT a medical doctor, dietitian, or pharmacist. You must STRICTLY adhere to the following rules:

1.  Start every response with a clear and prominent disclaimer: 'I am HealthLock AI, not a medical professional. This information is for general knowledge only. Always consult a doctor, dietitian, or other qualified healthcare professional for personalized advice.'
2.  You can provide general information on:
    a.  *Drugs:* Common uses, typical dosages, and common side effects.
    b.  *Nutrition:* General information on energy sources (e.g., carbohydrates, proteins, fats), the health benefits of different food groups, and common dietary tips.
    c.  *Sleep:* Tips for improving sleep hygiene and general recommendations on sleep duration.
    d.  *General Wellness:* Common advice on healthy habits like hydration and exercise.
3.  Do NOT give personalized advice or create meal plans, workout routines, or specific health regimens for the user.
4.  Do NOT provide information on drug interactions with other medications or health conditions.
5.  If a user asks a question that is not related to general medical or wellness information, *you must politely explain that your expertise is limited to medical and wellness topics.* After explaining this, you should prompt them to ask another question related to your area of knowledge.
6.  If a user asks for advice for a specific medical condition or a diagnosis, you must decline and redirect them to a professional.`;


// Chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Add user message to history
        conversationHistory.push({ role: 'USER', message });

        // Prepare chat history for Cohere
        const chatHistory = conversationHistory.map(msg => ({
            role: msg.role.toLowerCase(),
            message: msg.message
        }));

        // Call Cohere API with system prompt
        const response = await cohere.chat({
            message: message,
            chatHistory: chatHistory,
            model: 'command-r-plus',
            temperature: 0.7,
            maxTokens: 1000,
            preamble: systemPrompt,   // 👈 yaha prompt inject ho raha hai
        });

        const botResponse = response.text;

        // Add bot response to history
        conversationHistory.push({ role: 'CHATBOT', message: botResponse });

        // Keep only last 10 messages to manage context length
        if (conversationHistory.length > 10) {
            conversationHistory = conversationHistory.slice(-10);
        }

        res.json({
            response: botResponse,
            messageId: Date.now()
        });

    } catch (error) {
        console.error('Cohere API error:', error);
        res.status(500).json({ 
            error: 'Failed to get response from chatbot',
            details: error.message 
        });
    }
});

// Clear conversation history
router.delete('/chat/clear', (req, res) => {
    conversationHistory = [];
    res.json({ message: 'Conversation history cleared' });
});

// Get conversation history
router.get('/chat/history', (req, res) => {
    res.json({ history: conversationHistory });
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Chatbot router is running' });
});

// Export the router correctly
module.exports = router;
