// OpenAI Service Module
import { OPENAI_API_KEY } from './openai-config.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Generates a viral caption for a video using OpenAI's API
 * @param {string} fileName - Name of the video file
 * @param {string[]} platforms - Array of selected platforms
 * @returns {Promise<string>} Generated caption
 */
export async function generateViralCaption(fileName, platforms) {
    try {
        // Prepare the prompt with platform-specific guidance
        const prompt = `Generate a viral caption for a video named "${fileName}" that will perform well on these platforms: ${platforms.join(', ')}. 
        The caption should be:
        - Short and attention-grabbing
        - Include relevant hashtags
        - Use emojis where appropriate
        - Follow the viral trends for each platform
        - Include a call-to-action
        
        Format: Platform: Caption`;

        // Make API request
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 100
            })
        });

        if (!response.ok) {
            throw new Error('OpenAI API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error generating caption:', error);
        throw error;
    }
}

/**
 * Parses the OpenAI response into platform-specific captions
 * @param {string} response - OpenAI API response
 * @param {string[]} platforms - Array of selected platforms
 * @returns {Object} Object with platform-specific captions
 */
export function parseCaptions(response, platforms) {
    // Split the response into lines and parse platform captions
    const captionLines = response.split('\n').filter(line => line.trim());
    const captions = {};

    captionLines.forEach(line => {
        const [platform, caption] = line.split(':').map(part => part.trim());
        if (platform && caption) {
            captions[platform] = caption;
        }
    });

    // Ensure we have captions for all selected platforms
    platforms.forEach(platform => {
        if (!captions[platform]) {
            captions[platform] = 'No caption generated';
        }
    });

    return captions;
}
