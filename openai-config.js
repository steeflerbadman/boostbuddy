// OpenAI Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY';

// Export configuration for use in other modules
export { OPENAI_API_KEY };
async function generateCaptions(fileName, platforms) {
    try {
        const prompt = `Generate platform-specific captions for a video named "${fileName}". 
        Create a caption for each of these platforms: ${platforms.join(', ')}. 
        For each platform, provide a short, engaging caption that follows the platform's style. 
        Format: Platform: Caption`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: prompt
            }],
            temperature: 0.7,
            max_tokens: 500
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Error generating captions:', error);
        throw error;
    }
}

export { generateCaptions };
