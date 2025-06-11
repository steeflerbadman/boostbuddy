const OpenAI = require('openai');

exports.handler = async function(event) {
    try {
        const { videoName, platforms } = JSON.parse(event.body);

        if (!videoName || !Array.isArray(platforms) || platforms.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Invalid request parameters',
                    details: 'Please provide videoName and platforms array'
                })
            };
        }

        // Initialize OpenAI client
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        // Generate captions using OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: `Generate platform-specific captions for a video named "${videoName}". Create captions for: ${platforms.join(', ')}. Format each caption as: Platform: Caption. Keep captions concise and engaging.`
            }],
            temperature: 0.7,
            max_tokens: 500
        });

        // Parse the response
        const captions = parseCaptions(response.choices[0].message.content, platforms);

        return {
            statusCode: 200,
            body: JSON.stringify({ captions })
        };

    } catch (error) {
        console.error('Error generating captions:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to generate captions',
                details: error.message
            })
        };
    }
};

function parseCaptions(content, platforms) {
    const captions = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
        const [platform, caption] = line.split(':').map(s => s.trim());
        if (platform && caption) {
            captions[platform.toLowerCase()] = caption;
        }
    }

    // Ensure we have captions for all requested platforms
    const result = {};
    platforms.forEach(platform => {
        result[platform] = captions[platform.toLowerCase()] || 
            `Engaging caption for ${platform} coming soon!`;
    });

    return result;
}
