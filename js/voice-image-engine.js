// Voice & Image to App Engine - Revolutionary input methods

const VoiceImageEngine = {
    // Speech recognition
    recognition: null,
    isListening: false,

    // Initialize
    init() {
        this.setupSpeechRecognition();
        this.setupImageUpload();
    },

    // Setup speech recognition
    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                const promptField = document.getElementById('appPrompt');
                if (promptField) {
                    if (finalTranscript) {
                        promptField.value += (promptField.value ? ' ' : '') + finalTranscript;
                    }
                    // Show interim in a tooltip or overlay
                    this.showInterimText(interimTranscript);
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopListening();
                UIManager.toast('Voice recognition error: ' + event.error, 'error');
            };

            this.recognition.onend = () => {
                if (this.isListening) {
                    this.recognition.start(); // Restart if still listening
                }
            };
        }
    },

    // Setup image upload for sketch-to-app
    setupImageUpload() {
        // Create image upload zone
        const aiPanel = document.querySelector('.ai-generator-panel');
        if (aiPanel) {
            const uploadSection = document.createElement('div');
            uploadSection.className = 'image-upload-section';
            uploadSection.innerHTML = `
                <label><i class="fas fa-image"></i> Or upload a sketch/mockup</label>
                <div class="sketch-upload-zone" id="sketchUpload">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Drop sketch/mockup here or click to upload</span>
                    <small>AI will convert your design to code!</small>
                </div>
                <div class="uploaded-image-preview" id="imagePreview" style="display: none;">
                    <img src="" alt="Uploaded sketch">
                    <button class="remove-image" id="removeImage"><i class="fas fa-times"></i></button>
                </div>
            `;
            
            const inputSection = aiPanel.querySelector('.input-section');
            if (inputSection) {
                inputSection.after(uploadSection);
            }

            // Setup upload handlers
            const uploadZone = document.getElementById('sketchUpload');
            const preview = document.getElementById('imagePreview');
            const removeBtn = document.getElementById('removeImage');

            if (uploadZone) {
                uploadZone.addEventListener('click', () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => this.handleImageUpload(e.target.files[0]);
                    input.click();
                });

                uploadZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadZone.classList.add('dragover');
                });

                uploadZone.addEventListener('dragleave', () => {
                    uploadZone.classList.remove('dragover');
                });

                uploadZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    uploadZone.classList.remove('dragover');
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                        this.handleImageUpload(file);
                    }
                });
            }

            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    this.clearImage();
                });
            }
        }
    },

    // Handle image upload
    async handleImageUpload(file) {
        try {
            const dataUrl = await Utils.readFileAsDataURL(file);
            
            // Show preview
            const uploadZone = document.getElementById('sketchUpload');
            const preview = document.getElementById('imagePreview');
            const img = preview.querySelector('img');

            if (img) img.src = dataUrl;
            if (uploadZone) uploadZone.style.display = 'none';
            if (preview) preview.style.display = 'block';

            // Store for later use
            this.uploadedImage = dataUrl;

            UIManager.toast('Image uploaded! Click "Generate" to convert to app.', 'success');

        } catch (error) {
            console.error('Image upload error:', error);
            UIManager.toast('Failed to upload image', 'error');
        }
    },

    // Clear uploaded image
    clearImage() {
        this.uploadedImage = null;
        
        const uploadZone = document.getElementById('sketchUpload');
        const preview = document.getElementById('imagePreview');

        if (uploadZone) uploadZone.style.display = 'flex';
        if (preview) {
            preview.style.display = 'none';
            const img = preview.querySelector('img');
            if (img) img.src = '';
        }
    },

    // Start voice listening
    startListening() {
        if (!this.recognition) {
            UIManager.toast('Voice recognition not supported in your browser', 'error');
            return;
        }

        this.isListening = true;
        this.recognition.start();
        
        // Update UI
        const voiceBtn = document.getElementById('voiceInputBtn');
        if (voiceBtn) {
            voiceBtn.classList.add('listening');
            voiceBtn.innerHTML = '<i class="fas fa-microphone-alt"></i> Listening...';
        }

        UIManager.toast('Listening... Speak now!', 'info');
    },

    // Stop voice listening
    stopListening() {
        this.isListening = false;
        if (this.recognition) {
            this.recognition.stop();
        }

        // Update UI
        const voiceBtn = document.getElementById('voiceInputBtn');
        if (voiceBtn) {
            voiceBtn.classList.remove('listening');
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i> Voice';
        }
    },

    // Toggle voice listening
    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    },

    // Show interim text
    showInterimText(text) {
        let interimEl = document.getElementById('interimText');
        if (!interimEl) {
            interimEl = document.createElement('div');
            interimEl.id = 'interimText';
            interimEl.className = 'interim-text';
            const promptField = document.getElementById('appPrompt');
            if (promptField) {
                promptField.parentElement.appendChild(interimEl);
            }
        }
        interimEl.textContent = text;
        interimEl.style.display = text ? 'block' : 'none';
    },

    // Get uploaded image
    getUploadedImage() {
        return this.uploadedImage;
    },

    // Generate prompt from image (for AI)
    generateImagePrompt() {
        if (!this.uploadedImage) return null;

        return `I've uploaded an image of a design/mockup. Please analyze it and create a web app that matches this design as closely as possible. Pay attention to:
- Layout and spacing
- Colors and typography
- UI components shown
- Overall style and feel

Create a complete, functional HTML app based on this design.`;
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    VoiceImageEngine.init();
});

window.VoiceImageEngine = VoiceImageEngine;
