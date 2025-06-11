// Boost Links JavaScript

// DOM Elements
const boostForm = document.getElementById('boostForm');
const videoUrl = document.getElementById('videoUrl');
const platforms = document.querySelectorAll('.platform-checkbox input[type="checkbox"]');
const message = document.querySelector('.message');

// Error handling
function showError(error) {
    message.className = 'message error';
    message.textContent = `❌ ${error.message}`;
    message.style.display = 'block';
}

// Helper functions
function getSelectedPlatforms() {
    return Array.from(platforms)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
}

// Form submission
document.addEventListener('DOMContentLoaded', () => {
    boostForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const url = videoUrl.value.trim();
            if (!url) throw new Error('Please enter a video URL');

            const selectedPlatforms = getSelectedPlatforms();
            if (selectedPlatforms.length === 0) throw new Error('Please select at least one platform');

            // Simulate boost process
            message.style.display = 'block';
            message.className = '';
            message.textContent = 'Boosting video...';

            await new Promise(resolve => setTimeout(resolve, 2000));

            message.className = 'message success';
            message.textContent = 'Video boosted successfully!';

            // Clear form
            boostForm.reset();

            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                message.style.display = 'none';
            }, 3000);

        } catch (error) {
            showError(error);
        }
    });
});
