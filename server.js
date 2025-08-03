const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize Gemini AI
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for Gemini chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], image } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Handle image analysis if image is provided
    if (image) {
      return await handleImageAnalysis(req, res, message, image);
    }

    // Regular text chat
    return await handleTextChat(req, res, message, history);

  } catch (error) {
    console.error('Error with Gemini API:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to get response from Gemini';
    if (error.message.includes('model')) {
      errorMessage = 'Model not found or not supported. Please check your API key and model configuration.';
    } else if (error.message.includes('API key')) {
      errorMessage = 'Invalid API key. Please check your Gemini API key.';
    } else if (error.message.includes('quota')) {
      errorMessage = 'API quota exceeded. Please check your usage limits.';
    } else if (error.message.includes('image')) {
      errorMessage = 'Image analysis failed. Please try again with a different image.';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message 
    });
  }
});

// Handle text chat
async function handleTextChat(req, res, message, history) {
  try {
    // Get the Gemini model (using flash model as fallback)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create chat session
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role,
        parts: msg.parts,
      })),
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({
      response: text,
      history: [
        ...history,
        { role: 'user', parts: message },
        { role: 'model', parts: text }
      ]
    });

  } catch (error) {
    throw error;
  }
}

// Handle image analysis
async function handleImageAnalysis(req, res, message, image) {
  try {
    // Use Gemini Pro Vision for image analysis
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Convert base64 to Uint8Array
    const base64Data = image.data.split(',')[1];
    const imageData = Buffer.from(base64Data, 'base64');

    // Create the prompt with image
    const prompt = `Analyze this image and answer the following question: ${message}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData,
          mimeType: image.type
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    res.json({
      response: text,
      history: [
        { role: 'user', parts: `[Image Analysis] ${message}` },
        { role: 'model', parts: text }
      ]
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    throw new Error(`Image analysis failed: ${error.message}`);
  }
}

// API endpoint for image analysis (legacy endpoint)
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageData, prompt } = req.body;
    
    if (!imageData || !prompt) {
      return res.status(400).json({ error: 'Image data and prompt are required' });
    }

    // Use the same image analysis function
    const image = {
      data: imageData,
      type: 'image/jpeg' // Default type
    };

    await handleImageAnalysis(req, res, prompt, image);

  } catch (error) {
    console.error('Error with image analysis:', error);
    res.status(500).json({ 
      error: 'Failed to analyze image',
      details: error.message 
    });
  }
});

// API endpoint to get available models
app.get('/api/models', async (req, res) => {
  try {
    // For now, return a static list of available models
    // In the future, you could call the Gemini API to get available models
    const models = [
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        description: 'Fast and efficient for most tasks',
        type: 'text'
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'More powerful for complex tasks',
        type: 'text'
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro Vision',
        description: 'Supports image analysis',
        type: 'multimodal'
      }
    ];

    res.json({ models });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get models' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Gemini WebApp is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: [
      'text-chat',
      'image-analysis',
      'dark-mode',
      'conversation-export',
      'message-actions'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Gemini WebApp server running on http://localhost:${PORT}`);
  console.log(`📝 Make sure to set your GEMINI_API_KEY in the .env file`);
  console.log(`✨ New features: Dark mode, Image analysis, Export conversations`);
}); 