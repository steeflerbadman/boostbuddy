const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
const path = require('path');

// Load environment variables
const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
    console.error('Error loading .env file:', result.error);
    process.exit(1);
}

console.log('Environment variables loaded successfully');

// Initialize OpenAI with environment variable
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    console.error('Error: OPENAI_API_KEY is not set!');
    process.exit(1);
}

console.log('OpenAI API Key loaded successfully');

// Initialize OpenAI
const openaiClient = new OpenAI({
    apiKey: apiKey
});

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI with environment variable
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Verify API key is loaded
if (!process.env.OPENAI_API_KEY) {
    console.error('Warning: OPENAI_API_KEY environment variable not set!');
} else {
    console.log('OpenAI API Key loaded successfully');
}

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for generating captions
app.post('/api/generate-caption', async (req, res) => {
    try {
        console.log('Request received:', {
            fileName: req.body.fileName,
            platforms: req.body.platforms,
            timestamp: new Date().toISOString()
        });

        const { fileName, platforms } = req.body;
        
        if (!fileName || !Array.isArray(platforms) || platforms.length === 0) {
            return res.status(400).json({ 
                error: 'Invalid request parameters',
                details: 'Please provide a valid file name and at least one platform'
            });
        }

        // Generate captions using OpenAI
        try {
            const response = await openaiClient.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: `Generate platform-specific captions for a video named "${fileName}". Create captions for: ${platforms.join(', ')}. Format: Platform: Caption`
                }],
                temperature: 0.7,
                max_tokens: 500
            });

            const captions = parseCaptions(response.choices[0].message.content, platforms);
            console.log('Successfully generated captions:', captions);
            res.json({ captions });

        } catch (apiError) {
            console.error('OpenAI API error:', {
                error: apiError,
                type: apiError?.response?.data?.error?.type,
                message: apiError?.response?.data?.error?.message
            });
            
            if (apiError?.response?.data?.error?.type === 'insufficient_quota') {
                return res.status(403).json({
                    error: 'API quota exceeded',
                    details: 'Please check your API key quota and billing details'
                });
            }
            
            throw apiError;
        }

    } catch (error) {
        console.error('Error in generate-caption endpoint:', {
            error: error.message,
            name: error.name,
            stack: error.stack
        });
        
        const statusCode = error?.response?.status || 500;
        const errorMessage = error?.response?.data?.error?.message || 'Failed to generate captions';
        
        res.status(statusCode).json({ 
            error: errorMessage,
            details: error?.response?.data?.error?.type || 'Unknown error'
        });
    }
});

// Helper function to parse OpenAI response
function parseCaptions(generatedText, platforms) {
    const captions = {};
    const lines = generatedText.split('\n');
    for (const line of lines) {
        const [platform, caption] = line.split(': ').map(s => s.trim());
        if (platform && caption && platforms.includes(platform.toLowerCase())) {
            captions[platform.toLowerCase()] = caption;
        }
    }
    return captions;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
