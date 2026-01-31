// AI Engine - Handles AI generation with multi-provider support

const AIEngine = {
    // AI Provider configurations
    providers: {
        puter: {
            name: 'Puter.js (Grok)',
            requiresKey: false,
            models: ['x-ai/grok-4.1-fast'],
            defaultModel: 'x-ai/grok-4.1-fast',
            icon: 'fa-bolt'
        },
        openai: {
            name: 'OpenAI',
            requiresKey: true,
            models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
            defaultModel: 'gpt-4',
            icon: 'fa-robot',
            apiUrl: 'https://api.openai.com/v1/chat/completions'
        },
        claude: {
            name: 'Claude (Anthropic)',
            requiresKey: true,
            models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
            defaultModel: 'claude-3-sonnet-20240229',
            icon: 'fa-brain',
            apiUrl: 'https://api.anthropic.com/v1/messages'
        },
        gemini: {
            name: 'Google Gemini',
            requiresKey: true,
            models: ['gemini-pro', 'gemini-pro-vision'],
            defaultModel: 'gemini-pro',
            icon: 'fa-gem',
            apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models'
        },
        deepseek: {
            name: 'DeepSeek',
            requiresKey: true,
            models: ['deepseek-chat', 'deepseek-coder'],
            defaultModel: 'deepseek-chat',
            icon: 'fa-code',
            apiUrl: 'https://api.deepseek.com/v1/chat/completions'
        }
    },

    // Current settings
    settings: {
        provider: 'puter',
        apiKey: '',
        model: '',
        cacheEnabled: true,
        autoFormat: true
    },

    // Cache for AI responses
    cache: {},

    // Initialize
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.checkConnection();
    },

    // Load settings from storage
    loadSettings() {
        const saved = Utils.storage.get('appforge_ai_settings');
        if (saved) {
            this.settings = { ...this.settings, ...saved };
        }
        this.updateUI();
    },

    // Save settings to storage
    saveSettings() {
        Utils.storage.set('appforge_ai_settings', this.settings);
    },

    // Setup event listeners
    setupEventListeners() {
        // Provider selection
        const providerSelect = document.getElementById('aiProvider');
        if (providerSelect) {
            providerSelect.value = this.settings.provider;
            providerSelect.addEventListener('change', (e) => {
                this.setProvider(e.target.value);
            });
        }

        // API key input
        const apiKeyInput = document.getElementById('apiKey');
        if (apiKeyInput) {
            apiKeyInput.value = this.settings.apiKey;
            apiKeyInput.addEventListener('input', (e) => {
                this.settings.apiKey = e.target.value;
            });
        }

        // Toggle API key visibility
        const toggleApiKey = document.getElementById('toggleApiKey');
        if (toggleApiKey) {
            toggleApiKey.addEventListener('click', () => {
                const type = apiKeyInput.type === 'password' ? 'text' : 'password';
                apiKeyInput.type = type;
                toggleApiKey.innerHTML = `<i class="fas fa-${type === 'password' ? 'eye' : 'eye-slash'}"></i>`;
            });
        }

        // Model selection
        const modelSelect = document.getElementById('aiModel');
        if (modelSelect) {
            this.updateModelOptions();
            modelSelect.value = this.settings.model || '';
            modelSelect.addEventListener('change', (e) => {
                this.settings.model = e.target.value;
            });
        }

        // Cache toggle
        const cacheToggle = document.getElementById('cacheResponses');
        if (cacheToggle) {
            cacheToggle.checked = this.settings.cacheEnabled;
            cacheToggle.addEventListener('change', (e) => {
                this.settings.cacheEnabled = e.target.checked;
            });
        }

        // Auto format toggle
        const formatToggle = document.getElementById('autoFormat');
        if (formatToggle) {
            formatToggle.checked = this.settings.autoFormat;
            formatToggle.addEventListener('change', (e) => {
                this.settings.autoFormat = e.target.checked;
            });
        }
    },

    // Set provider
    setProvider(provider) {
        this.settings.provider = provider;
        this.updateModelOptions();
        this.updateUI();
        this.checkConnection();
    },

    // Update UI based on provider
    updateUI() {
        const provider = this.providers[this.settings.provider];
        const apiKeyGroup = document.getElementById('apiKeyGroup');
        const modelGroup = document.getElementById('modelGroup');

        if (provider) {
            // Show/hide API key field
            if (apiKeyGroup) {
                apiKeyGroup.style.display = provider.requiresKey ? 'block' : 'none';
            }

            // Show model selector for all providers
            if (modelGroup) {
                modelGroup.style.display = 'block';
            }
        }
    },

    // Update model options
    updateModelOptions() {
        const modelSelect = document.getElementById('aiModel');
        if (!modelSelect) return;

        const provider = this.providers[this.settings.provider];
        if (!provider) return;

        modelSelect.innerHTML = '<option value="">Auto-select</option>' +
            provider.models.map(model => `<option value="${model}">${model}</option>`).join('');
    },

    // Check AI connection
    async checkConnection() {
        const statusEl = document.getElementById('connectionStatus');
        if (!statusEl) return;

        UIManager.updateConnectionStatus('checking', 'Checking AI connection...');

        const provider = this.settings.provider;

        if (provider === 'puter') {
            // Check Puter.js
            if (typeof puter !== 'undefined' && puter.ai) {
                UIManager.updateConnectionStatus('connected', 'Connected to Puter.js AI (Free)');
                return true;
            } else {
                // Wait and retry
                setTimeout(() => this.checkConnection(), 2000);
                return false;
            }
        } else {
            // Check custom provider
            if (this.settings.apiKey) {
                UIManager.updateConnectionStatus('connected', `Using ${this.providers[provider].name}`);
                return true;
            } else {
                UIManager.updateConnectionStatus('disconnected', `${this.providers[provider].name} - API key needed`);
                return false;
            }
        }
    },

    // Generate app
    async generate(prompt, options = {}) {
        // Check cache first
        if (this.settings.cacheEnabled) {
            const cacheKey = this.generateCacheKey(prompt, options);
            if (this.cache[cacheKey]) {
                UIManager.toast('Using cached response', 'info');
                return this.cache[cacheKey];
            }
        }

        const provider = this.settings.provider;

        try {
            let response;

            if (provider === 'puter') {
                response = await this.generateWithPuter(prompt, options);
            } else {
                response = await this.generateWithCustomProvider(prompt, options);
            }

            // Cache response
            if (this.settings.cacheEnabled) {
                const cacheKey = this.generateCacheKey(prompt, options);
                this.cache[cacheKey] = response;
            }

            // Track usage
            UserManager.trackUsage('aiGenerations');

            return response;

        } catch (error) {
            console.error('AI generation error:', error);
            throw error;
        }
    },

    // Generate with Puter.js
    async generateWithPuter(prompt, options = {}) {
        if (typeof puter === 'undefined' || !puter.ai) {
            throw new Error('Puter.js not available');
        }

        const systemPrompt = this.buildSystemPrompt(prompt, options);

        const response = await puter.ai.chat(
            systemPrompt,
            { 
                model: this.settings.model || this.providers.puter.defaultModel,
                max_tokens: 4000 
            }
        );

        if (response && response.message && response.message.content) {
            let code = response.message.content;
            
            // Extract code from markdown if needed
            code = this.extractCode(code);
            
            // Auto-format if enabled
            if (this.settings.autoFormat) {
                code = this.formatGeneratedCode(code);
            }

            return code;
        } else {
            throw new Error('Invalid response from AI');
        }
    },

    // Generate with custom provider
    async generateWithCustomProvider(prompt, options = {}) {
        const provider = this.providers[this.settings.provider];
        
        if (!this.settings.apiKey) {
            throw new Error('API key required');
        }

        const systemPrompt = this.buildSystemPrompt(prompt, options);
        const model = this.settings.model || provider.defaultModel;

        let requestBody, headers;

        switch (this.settings.provider) {
            case 'openai':
                headers = {
                    'Authorization': `Bearer ${this.settings.apiKey}`,
                    'Content-Type': 'application/json'
                };
                requestBody = {
                    model: model,
                    messages: [
                        { role: 'system', content: 'You are an expert web developer.' },
                        { role: 'user', content: systemPrompt }
                    ],
                    max_tokens: 4000
                };
                break;

            case 'claude':
                headers = {
                    'x-api-key': this.settings.apiKey,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                };
                requestBody = {
                    model: model,
                    max_tokens: 4000,
                    messages: [{ role: 'user', content: systemPrompt }]
                };
                break;

            case 'gemini':
                headers = { 'Content-Type': 'application/json' };
                requestBody = {
                    contents: [{ parts: [{ text: systemPrompt }] }]
                };
                break;

            case 'deepseek':
                headers = {
                    'Authorization': `Bearer ${this.settings.apiKey}`,
                    'Content-Type': 'application/json'
                };
                requestBody = {
                    model: model,
                    messages: [
                        { role: 'system', content: 'You are an expert web developer.' },
                        { role: 'user', content: systemPrompt }
                    ],
                    max_tokens: 4000
                };
                break;

            default:
                throw new Error('Unknown provider');
        }

        const apiUrl = this.settings.provider === 'gemini' 
            ? `${provider.apiUrl}/${model}:generateContent?key=${this.settings.apiKey}`
            : provider.apiUrl;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API error: ${error}`);
        }

        const data = await response.json();
        let content = this.extractContentFromResponse(data, this.settings.provider);
        
        // Extract code from markdown if needed
        content = this.extractCode(content);
        
        // Auto-format if enabled
        if (this.settings.autoFormat) {
            content = this.formatGeneratedCode(content);
        }

        return content;
    },

    // Build system prompt
    buildSystemPrompt(userPrompt, options = {}) {
        const appType = options.appType || 'webapp';
        const colorScheme = options.colorScheme || 'blue';
        const features = options.features || {};

        let prompt = `You are an expert web developer. Generate a complete, production-ready HTML page.

USER REQUEST: ${userPrompt}

REQUIREMENTS:
1. Create a complete, valid HTML5 document with DOCTYPE, html, head, and body
2. Include responsive CSS using modern techniques (Flexbox, Grid)
3. Add interactive JavaScript functionality
4. Use a professional ${colorScheme} color scheme
5. Ensure mobile-first responsive design
6. Include Font Awesome icons (CDN: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css)
7. Write clean, well-commented code
8. Make it visually stunning with modern UI patterns`;

        if (features.responsive !== false) {
            prompt += '\n9. Must be fully responsive for mobile, tablet, and desktop';
        }

        if (features.animations) {
            prompt += '\n10. Include smooth CSS animations and transitions';
        }

        if (features.darkMode) {
            prompt += '\n11. Implement dark/light mode toggle functionality';
        }

        if (features.pwa) {
            prompt += '\n12. Make it PWA-ready with service worker structure';
        }

        if (appType === 'pwa') {
            prompt += '\n13. Include manifest.json structure and offline capability';
        }

        prompt += `\n
IMPORTANT:
- Return ONLY the complete HTML code
- Do NOT wrap in markdown code blocks
- Do NOT include explanations
- Ensure all CSS is embedded in style tags
- Ensure all JS is embedded in script tags
- Use placeholder images from https://via.placeholder.com/ where needed`;

        return prompt;
    },

    // Extract code from markdown
    extractCode(text) {
        // Check if wrapped in code blocks
        const codeBlockMatch = text.match(/```(?:html)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
            return codeBlockMatch[1].trim();
        }
        return text.trim();
    },

    // Format generated code
    formatGeneratedCode(code) {
        // Basic formatting - ensure proper indentation
        // This is a simplified formatter
        return code;
    },

    // Extract content from different provider responses
    extractContentFromResponse(data, provider) {
        switch (provider) {
            case 'openai':
            case 'deepseek':
                return data.choices[0].message.content;
            case 'claude':
                return data.content[0].text;
            case 'gemini':
                return data.candidates[0].content.parts[0].text;
            default:
                throw new Error('Unknown provider response format');
        }
    },

    // Generate cache key
    generateCacheKey(prompt, options) {
        return Utils.compress(prompt + JSON.stringify(options));
    },

    // Get current settings
    getSettings() {
        return { ...this.settings };
    },

    // Update settings
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        this.updateUI();
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    AIEngine.init();
});

window.AIEngine = AIEngine;
