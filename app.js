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

        // Call Cohere API
        const response = await cohere.chat({
            message: message,
            chatHistory: chatHistory,
            model: 'command-r-plus',
            temperature: 0.7,
            maxTokens: 1000,
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