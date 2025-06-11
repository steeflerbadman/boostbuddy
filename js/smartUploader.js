// Smart Uploader JavaScript

class SmartUploaderApp {
    constructor() {
        // DOM Elements
        this.fileUpload = document.querySelector('.upload-section');
        this.videoFile = document.querySelector('input[type="file"]');
        this.platformCheckboxes = document.querySelectorAll('.platform-checkbox input[type="checkbox"]');
        this.uploadButton = document.querySelector('.upload-button');
        this.message = document.querySelector('.message');
        this.caption = document.querySelector('#caption');
        this.aiToggle = document.querySelector('#aiToggle');

        // OpenAI API configuration
        this.OPENAI_API_KEY = window.location.hostname === 'localhost'
            ? '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'
            : '';
        // In production, the API key should be handled by a backend server
        // This is just a placeholder for local development
    }

    // Error handling
    showError(error) {
        this.message.className = 'message error';
        this.message.textContent = `❌ ${error.message}`;
        this.message.style.display = 'block';
    }

    // Helper functions
    getSelectedPlatforms() {
        return Array.from(this.platformCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
    }

    getVideoFile() {
        const file = this.videoFile.files[0];
        if (!file) throw new Error('Please select a video file');
        if (file.size > 50 * 1024 * 1024) throw new Error('File size must be less than 50MB');
        return file;
    }

    updateUploadState() {
        this.uploadButton.disabled = this.videoFile.files.length === 0 || !Array.from(this.platformCheckboxes).some(checkbox => checkbox.checked);
    }

    // Event Listeners
    initEventListeners() {
        // Add focus styles
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => input.classList.add('focused'));
            input.addEventListener('blur', () => input.classList.remove('focused'));
        });

        // Drag and drop
        this.fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.fileUpload.style.borderColor = '#1a73e8';
        });

        this.fileUpload.addEventListener('dragleave', () => {
            this.fileUpload.style.borderColor = '#e0e0e0';
        });

        this.fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            this.fileUpload.style.borderColor = '#e0e0e0';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.videoFile.files = files;
                this.updateUploadState();
            }
        });

        // File selection
        this.videoFile.addEventListener('change', () => this.updateUploadState());

        // Platform selection
        this.platformCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateUploadState());
        });

        // Upload button
        this.uploadButton.addEventListener('click', async () => {
            try {
                this.uploadButton.disabled = true;
                this.message.style.display = 'block';
                this.message.className = '';
                this.message.textContent = 'Processing video...';

                const file = await this.getVideoFile();
                const platforms = this.getSelectedPlatforms();
                const useAI = this.aiToggle.checked;

                // Generate captions if AI is enabled
                let captions = {};
                if (useAI) {
                    try {
                        const generatedCaptions = await this.generateCaptions(file.name, platforms);
                        captions = this.parseCaptions(generatedCaptions, platforms);
                    } catch (error) {
                        console.error('AI caption generation failed:', error);
                        captions = {};
                        platforms.forEach(platform => {
                            captions[platform] = this.caption.value.trim();
                        });
                    }
                } else {
                    const userCaption = this.caption.value.trim();
                    platforms.forEach(platform => {
                        captions[platform] = userCaption;
                    });
                }

                // Simulate upload process
                await new Promise(resolve => setTimeout(resolve, 3000));

                this.message.className = 'message success';
                this.message.textContent = 'Video processed successfully!';

            } catch (error) {
                this.showError(error);
            } finally {
                this.uploadButton.disabled = false;
            }
        });

        // Initial state
        this.updateUploadState();
    }

    // AI Caption Generation
    async generateCaptions(fileName, platforms) {
        try {
            console.log('Generating captions for:', fileName, 'on platforms:', platforms);
            
            const response = await fetch('/api/generate-captions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fileName,
                    platforms
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Caption generation failed: ${errorData.error || 'Unknown error'}`);
            }
            
            const data = await response.json();
            console.log('Backend response:', data);
            return data.captions;
        } catch (error) {
            console.error('Error in generateCaptions:', {
                error: error.message,
                name: error.name,
                stack: error.stack
            });
            throw error;
        }
    }

    parseCaptions(generatedText, platforms) {
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

    init() {
        this.initEventListeners();
    }
}

// Initialize the app
const app = new SmartUploaderApp();
document.addEventListener('DOMContentLoaded', () => app.init());
