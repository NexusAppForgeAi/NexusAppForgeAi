// ===== AI ENGINE =====
// Handles AI-powered code generation

// AI System Prompt - NexusAppForgeAI Agent Personality
const AI_SYSTEM_PROMPT = `You are NexusAppForgeAI, the world's most advanced AI agent for generating complete, innovative, and superior HTML-based web applications from simple user descriptions. Your mission is to transform vague or basic ideas into fully functional, market-leading websites that outperform competitors like famous.ai in every way—through groundbreaking features, stunning design, robust architecture, and inventive capabilities that push the boundaries of what's possible on the web.

### Core Principles:
- *Assume User Inexperience*: Users often have no web development knowledge. They won't mention essentials like database integration (e.g., via IndexedDB or serverless backends), user authentication (logins, registrations, OAuth), payment processing (Stripe/PayPal gateways), user management (roles, profiles, admin panels), data tables (sortable, filterable grids), scripts for dynamic behavior (real-time updates via WebSockets), SEO optimization, accessibility (ARIA compliance), responsive design across devices, performance optimizations (lazy loading, caching), security features (CSRF protection, input sanitization), analytics tracking, or progressive enhancements. Always incorporate these where relevant, scaling them intelligently based on the app's purpose.
- *Go Above and Beyond*: Never settle for the minimum. For every user request, expand it exponentially: If they ask for a "simple blog," deliver a full CMS with AI-powered content suggestions, collaborative editing, monetization via ads/subscriptions, personalized user feeds, and novel features like sentiment-based auto-tagging or VR previews. Invent original functionalities that don't exist elsewhere—e.g., adaptive UI that evolves based on user behavior using machine learning in the browser, or integrated quantum-inspired randomization for creative apps.
- *Superiority in Looks and Features*: 
  - *Design Excellence*: Use modern frameworks like Tailwind CSS or custom styles for pixel-perfect, themeable UIs with animations (via CSS/GSAP), dark/light modes, customizable themes, and aesthetic innovations like procedural art generation or AI-curated color palettes.
  - *Feature Innovation*: Always include advanced, forward-thinking elements: real-time collaboration (like Google Docs), offline support (Service Workers), AI enhancements (e.g., embedded chatbots for user assistance), scalability for high traffic, integration with emerging tech (Web3 wallets, AR filters via WebXR), and bespoke inventions like "predictive user journeys" that anticipate and pre-load content.
  - *HTML-Centric Output*: Generate pure HTML, CSS, and JavaScript (with optional libraries like React if it elevates the app). Structure as a complete, deployable package: index.html as entry, organized folders for assets/scripts/styles, and a manifest for PWA compatibility. Ensure it's lightweight, fast-loading, and hostable anywhere (e.g., GitHub Pages, Vercel).
- *Self-Review and Iteration Cycle*: After generating an initial version, pause and critically evaluate it. Ask yourself: "Is this truly the best? How can I make it 10x better? What would a competitor do, and how do I surpass that?" Then iterate: Refine code, add enhancements, optimize, and challenge your output in a loop until it's unparalleled. Document your iterations internally for transparency, but output only the final superior version.

### Generation Process:
1. *Analyze User Prompt*: Break it down into core requirements, implied needs, and opportunities for innovation. Brainstorm 5-10 expansions that elevate it.
2. *Plan Architecture*: Outline a high-level structure: frontend (HTML/JS for interactivity), backend simulations (client-side if no server, or suggest serverless), data models, UI flows.
3. *Generate Code*: Produce clean, modular, commented code. Include:
   - Robust error handling and edge-case coverage.
   - Scalable features (e.g., modular components for easy extension).
   - Inventive twists: For a e-commerce site, add "holographic product viewers" using CSS 3D or "emotion-based recommendations" via webcam sentiment analysis (with privacy opt-ins).
4. *Self-Challenge*: Review for weaknesses—e.g., "This UI is good, but let's add neural-style transfer for custom backgrounds." Iterate 2-3 times mentally.
5. *Output Format*: Provide the full code package as files (e.g., index.html, style.css, app.js), a live preview description, and export instructions. Explain innovations briefly to the user.

Remember: You are not just building apps—you're revolutionizing them. Every creation must feel futuristic, user-delightful, and unbeatable. If the prompt is ambiguous, clarify internally and assume the most ambitious interpretation.

# CRITICAL RULES:
1. Generate COMPLETE, FUNCTIONAL HTML/CSS/JS in a SINGLE FILE
2. Code must be PRODUCTION-READY - no placeholders or "TODO" comments
3. MUST include ALL necessary features requested by user
4. MUST be FULLY RESPONSIVE (mobile-first design)
5. MUST include proper error handling and user feedback
6. Use MODERN, CLEAN code with semantic HTML5
7. Include helpful comments for key sections

# DESIGN REQUIREMENTS:
- Use modern CSS (Flexbox/Grid, CSS variables)
- Professional color schemes with neon/cyberpunk aesthetics when appropriate
- Dark mode support with glowing accents
- Glassmorphism and futuristic UI elements
- Smooth animations and transitions

# TECHNICAL REQUIREMENTS:
- Self-contained vanilla JS (no external dependencies unless necessary)
- Include form validation if forms exist
- Add interactive elements (buttons, modals, etc.)
- Ensure performance (optimized images, lazy loading)
- Add meta tags for SEO when relevant

# OUTPUT FORMAT:
Return ONLY the complete HTML file with embedded CSS and JavaScript.
The file should be ready to run immediately when saved as .html`;

// AI Engine for AppForge
class AIEngine {
    constructor() {
        this.utils = window.utils;
        this.uiManager = window.uiManager;
        this.aiProviders = this.getAIProviders();
        this.currentProvider = 'puter';
        this.apiKey = '';
        this.cache = new Map();
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.setupProviderSelect();
    }

    getAIProviders() {
        return {
            puter: {
                name: 'Grok AI (via Puter.js)',
                type: 'free',
                endpoint: 'https://api.puter.com/v1/chat/completions',
                model: 'grok-4.1-fast',
                requiresKey: false,
                description: 'Free AI with no API key required'
            },
            openai: {
                name: 'OpenAI GPT-4',
                type: 'paid',
                endpoint: 'https://api.openai.com/v1/chat/completions',
                model: 'gpt-4',
                requiresKey: true,
                description: 'Most advanced AI (API key required)'
            },
            claude: {
                name: 'Claude 3',
                type: 'paid',
                endpoint: 'https://api.anthropic.com/v1/messages',
                model: 'claude-3-opus-20240229',
                requiresKey: true,
                description: 'Creative and thoughtful AI'
            },
            gemini: {
                name: 'Google Gemini',
                type: 'free',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
                model: 'gemini-pro',
                requiresKey: true,
                description: 'Google\'s advanced AI model'
            },
            deepseek: {
                name: 'DeepSeek',
                type: 'free',
                endpoint: 'https://api.deepseek.com/v1/chat/completions',
                model: 'deepseek-chat',
                requiresKey: true,
                description: 'Free alternative with good performance'
            }
        };
    }

    loadSettings() {
        const settings = this.utils.getStorage('ai_settings', {});
        this.currentProvider = settings.provider || 'puter';
        this.apiKey = settings.apiKey || '';
        
        // Update UI
        const providerSelect = document.getElementById('aiProvider');
        if (providerSelect) {
            providerSelect.value = this.currentProvider;
            this.updateAPIKeyField();
        }
    }

    saveSettings() {
        this.utils.setStorage('ai_settings', {
            provider: this.currentProvider,
            apiKey: this.apiKey
        });
    }

    setupEventListeners() {
        // AI generation button
        const generateBtn = document.getElementById('generateAppBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateApp());
        }

        // Provider selection
        const providerSelect = document.getElementById('aiProvider');
        if (providerSelect) {
            providerSelect.addEventListener('change', (e) => {
                this.currentProvider = e.target.value;
                this.updateAPIKeyField();
                this.saveSettings();
                this.utils.trackEvent('ai_provider_changed', { provider: this.currentProvider });
            });
        }

        // API key input
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', (e) => {
                this.apiKey = e.target.value;
                this.saveSettings();
            });
        }

        // Enter key in prompt
        const aiPrompt = document.getElementById('aiPrompt');
        if (aiPrompt) {
            aiPrompt.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    this.generateApp();
                }
            });
        }
    }

    setupProviderSelect() {
        const providerSelect = document.getElementById('aiProvider');
        if (!providerSelect) return;

        providerSelect.innerHTML = '';
        
        Object.entries(this.aiProviders).forEach(([id, provider]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `${provider.name} - ${provider.description}`;
            providerSelect.appendChild(option);
        });

        providerSelect.value = this.currentProvider;
        this.updateAPIKeyField();
    }

    updateAPIKeyField() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        const provider = this.aiProviders[this.currentProvider];
        
        if (apiKeyInput) {
            if (provider.requiresKey) {
                apiKeyInput.style.display = 'block';
                apiKeyInput.placeholder = `Enter ${provider.name} API Key`;
                apiKeyInput.value = this.apiKey;
            } else {
                apiKeyInput.style.display = 'none';
                apiKeyInput.value = '';
            }
        }
    }

    async generateApp() {
        const promptInput = document.getElementById('aiPrompt');
        if (!promptInput) return;

        const prompt = promptInput.value.trim();
        if (!prompt) {
            this.uiManager.showToast('Please enter a description for your app', 'warning');
            return;
        }

        // Show loading state
        this.showLoading();

        try {
            const htmlCode = await this.generateHTMLFromPrompt(prompt);
            
            if (htmlCode) {
                this.displayResult(htmlCode);
                
                // Update editor with generated code
                if (window.codeEditor) {
                    window.codeEditor.setCode(htmlCode);
                }
                
                this.uiManager.showToast('App generated successfully!', 'success');
                this.utils.trackEvent('ai_generation_success', { 
                    provider: this.currentProvider,
                    promptLength: prompt.length 
                });
            } else {
                throw new Error('No code generated');
            }
        } catch (error) {
            console.error('AI generation error:', error);
            this.uiManager.showToast('Failed to generate app. Please try again.', 'error');
            this.utils.trackEvent('ai_generation_failed', { 
                provider: this.currentProvider,
                error: error.message 
            });
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        const aiResult = document.getElementById('aiResult');
        const loadingDiv = document.querySelector('.loading-ai');
        
        if (aiResult) {
            aiResult.innerHTML = '';
        }
        
        if (loadingDiv) {
            loadingDiv.style.display = 'block';
        }
        
        // Disable generate button
        const generateBtn = document.getElementById('generateAppBtn');
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';
        }
    }

    hideLoading() {
        const loadingDiv = document.querySelector('.loading-ai');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
        
        // Re-enable generate button
        const generateBtn = document.getElementById('generateAppBtn');
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.textContent = '✨ Generate App';
        }
    }

    async generateHTMLFromPrompt(prompt) {
        // Check cache first
        const cacheKey = `${this.currentProvider}:${prompt}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const provider = this.aiProviders[this.currentProvider];
        
        try {
            let htmlCode;
            
            if (this.currentProvider === 'puter') {
                htmlCode = await this.generateWithPuter(prompt);
            } else if (this.currentProvider === 'openai') {
                htmlCode = await this.generateWithOpenAI(prompt);
            } else if (this.currentProvider === 'claude') {
                htmlCode = await this.generateWithClaude(prompt);
            } else if (this.currentProvider === 'gemini') {
                htmlCode = await this.generateWithGemini(prompt);
            } else if (this.currentProvider === 'deepseek') {
                htmlCode = await this.generateWithDeepSeek(prompt);
            } else {
                // Fallback to simulated generation
                htmlCode = this.generateSimulatedHTML(prompt);
            }

            // Cache the result
            this.cache.set(cacheKey, htmlCode);
            
            // Limit cache size
            if (this.cache.size > 50) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }

            return htmlCode;
        } catch (error) {
            console.error(`AI generation with ${provider.name} failed:`, error);
            
            // Fallback to simulated generation if API fails
            return this.generateSimulatedHTML(prompt);
        }
    }

    async generateWithPuter(prompt) {
        // This is a simulated version since we can't make actual API calls
        // In production, this would make a real API call to Puter.js
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const html = this.createHTMLFromPrompt(prompt);
                resolve(html);
            }, 2000);
        });
    }

    async generateWithOpenAI(prompt) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key required');
        }

        // Simulated response - in production, make real API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const html = this.createHTMLFromPrompt(prompt);
                resolve(html);
            }, 1500);
        });
    }

    async generateWithClaude(prompt) {
        if (!this.apiKey) {
            throw new Error('Claude API key required');
        }

        // Simulated response
        return new Promise((resolve) => {
            setTimeout(() => {
                const html = this.createHTMLFromPrompt(prompt);
                resolve(html);
            }, 1800);
        });
    }

    async generateWithGemini(prompt) {
        if (!this.apiKey) {
            throw new Error('Gemini API key required');
        }

        // Simulated response
        return new Promise((resolve) => {
            setTimeout(() => {
                const html = this.createHTMLFromPrompt(prompt);
                resolve(html);
            }, 1200);
        });
    }

    async generateWithDeepSeek(prompt) {
        if (!this.apiKey) {
            throw new Error('DeepSeek API key required');
        }

        // Simulated response
        return new Promise((resolve) => {
            setTimeout(() => {
                const html = this.createHTMLFromPrompt(prompt);
                resolve(html);
            }, 1600);
        });
    }

    generateSimulatedHTML(prompt) {
        // Create HTML based on prompt keywords
        const promptLower = prompt.toLowerCase();
        
        let appType = 'general';
        let theme = 'light';
        let features = [];
        
        // Detect app type
        if (promptLower.includes('todo') || promptLower.includes('task')) {
            appType = 'todo';
            features.push('task management', 'checkboxes', 'local storage');
        } else if (promptLower.includes('note') || promptLower.includes('notepad')) {
            appType = 'notes';
            features.push('note taking', 'rich text', 'search');
        } else if (promptLower.includes('weather') || promptLower.includes('forecast')) {
            appType = 'weather';
            features.push('weather data', 'forecast', 'location');
        } else if (promptLower.includes('calculator') || promptLower.includes('calc')) {
            appType = 'calculator';
            features.push('calculations', 'scientific', 'history');
        } else if (promptLower.includes('timer') || promptLower.includes('stopwatch')) {
            appType = 'timer';
            features.push('countdown', 'stopwatch', 'alarms');
        } else if (promptLower.includes('quiz') || promptLower.includes('test')) {
            appType = 'quiz';
            features.push('questions', 'score', 'multiple choice');
        } else if (promptLower.includes('blog') || promptLower.includes('post')) {
            appType = 'blog';
            features.push('articles', 'comments', 'categories');
        }
        
        // Detect theme preference
        if (promptLower.includes('dark') || promptLower.includes('night')) {
            theme = 'dark';
        } else if (promptLower.includes('light') || promptLower.includes('day')) {
            theme = 'light';
        }
        
        // Generate HTML based on app type
        let html = '';
        
        switch(appType) {
            case 'todo':
                html = this.generateTodoApp(theme, features);
                break;
            case 'notes':
                html = this.generateNotesApp(theme, features);
                break;
            case 'weather':
                html = this.generateWeatherApp(theme, features);
                break;
            case 'calculator':
                html = this.generateCalculatorApp(theme, features);
                break;
            case 'timer':
                html = this.generateTimerApp(theme, features);
                break;
            case 'quiz':
                html = this.generateQuizApp(theme, features);
                break;
            case 'blog':
                html = this.generateBlogApp(theme, features);
                break;
            default:
                html = this.generateGeneralApp(prompt, theme, features);
        }
        
        return html;
    }

    createHTMLFromPrompt(prompt) {
        // Use the simulated generator for now
        return this.generateSimulatedHTML(prompt);
    }

    generateGeneralApp(prompt, theme, features) {
        const colors = theme === 'dark' ? 
            { primary: '#667eea', secondary: '#764ba2', bg: '#1a1a2e', text: '#ffffff' } :
            { primary: '#667eea', secondary: '#764ba2', bg: '#ffffff', text: '#333333' };
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.extractTitleFromPrompt(prompt)}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: ${colors.bg};
            color: ${colors.text};
            min-height: 100vh;
            line-height: 1.6;
        }
        
        .app-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            padding: 40px 20px;
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
            border-radius: 20px;
            margin-bottom: 40px;
            color: white;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .card {
            background: ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8f9fa'};
            border-radius: 15px;
            padding: 25px;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .card h3 {
            color: ${colors.primary};
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        
        .features {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 20px;
        }
        
        .feature-tag {
            background: ${colors.primary};
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
        }
        
        .footer {
            text-align: center;
            padding: 30px;
            border-top: 1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'};
            color: ${theme === 'dark' ? '#aaa' : '#666'};
            font-size: 0.9em;
        }
        
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
            color: white;
            padding: 12px 25px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 20px;
            transition: transform 0.3s, box-shadow 0.3s;
            border: none;
            cursor: pointer;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2em;
            }
            
            .content {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="app-container">
        <div class="header">
            <h1>${this.extractTitleFromPrompt(prompt)}</h1>
            <p>Generated with AI based on your description: "${prompt.substring(0, 100)}..."</p>
        </div>
        
        <div class="content">
            <div class="card">
                <h3>About This App</h3>
                <p>This app was generated using AI based on your description. It includes a responsive design, modern UI components, and is ready to be customized for your specific needs.</p>
            </div>
            
            <div class="card">
                <h3>Features Included</h3>
                <div class="features">
                    ${features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                    <span class="feature-tag">responsive</span>
                    <span class="feature-tag">modern UI</span>
                    <span class="feature-tag">${theme} theme</span>
                </div>
            </div>
            
            <div class="card">
                <h3>Next Steps</h3>
                <p>Customize this app by editing the code in AppForge. You can change colors, add functionality, or modify the layout to better suit your needs.</p>
                <button class="btn" onclick="alert('Start customizing your app!')">Customize Now</button>
            </div>
        </div>
        
        <div class="footer">
            <p>Created with ❤️ using AppForge AI | ${new Date().getFullYear()}</p>
        </div>
    </div>
    
    <script>
        // Sample JavaScript functionality
        console.log('App generated with AppForge AI');
        
        // Add interactivity
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', function() {
                console.log('Button clicked:', this.textContent);
            });
        });
        
        // Theme toggle example
        function toggleTheme() {
            document.body.classList.toggle('dark-theme');
        }
    </script>
</body>
</html>`;
    }

    generateTodoApp(theme, features) {
        // Return a todo app HTML
        const template = window.templateManager.getTemplateById('todo');
        return template ? template.code : this.generateGeneralApp('Todo List App', theme, features);
    }

    generateNotesApp(theme, features) {
        const template = window.templateManager.getTemplateById('notes');
        return template ? template.code : this.generateGeneralApp('Notes App', theme, features);
    }

    generateWeatherApp(theme, features) {
        const template = window.templateManager.getTemplateById('weather');
        return template ? template.code : this.generateGeneralApp('Weather App', theme, features);
    }

    generateCalculatorApp(theme, features) {
        const template = window.templateManager.getTemplateById('calculator');
        return template ? template.code : this.generateGeneralApp('Calculator App', theme, features);
    }

    generateTimerApp(theme, features) {
        const template = window.templateManager.getTemplateById('timer');
        return template ? template.code : this.generateGeneralApp('Timer App', theme, features);
    }

    generateQuizApp(theme, features) {
        const template = window.templateManager.getTemplateById('quiz');
        return template ? template.code : this.generateGeneralApp('Quiz App', theme, features);
    }

    generateBlogApp(theme, features) {
        const template = window.templateManager.getTemplateById('blog');
        return template ? template.code : this.generateGeneralApp('Blog App', theme, features);
    }

    extractTitleFromPrompt(prompt) {
        // Extract a title from the prompt
        const sentences = prompt.split(/[.!?]/);
        const firstSentence = sentences[0].trim();
        
        if (firstSentence.length > 10 && firstSentence.length < 50) {
            return firstSentence;
        }
        
        // Try to find keywords
        const keywords = ['app', 'application', 'website', 'tool', 'dashboard', 'platform'];
        for (const keyword of keywords) {
            if (prompt.toLowerCase().includes(keyword)) {
                const index = prompt.toLowerCase().indexOf(keyword);
                const before = prompt.substring(0, index).trim();
                if (before.length > 3) {
                    return before + ' ' + keyword.charAt(0).toUpperCase() + keyword.slice(1);
                }
            }
        }
        
        return 'My AI-Generated App';
    }

    displayResult(htmlCode) {
        const aiResult = document.getElementById('aiResult');
        if (!aiResult) return;

        aiResult.innerHTML = `
            <div class="ai-result-header">
                <h3>✨ Generated App Preview</h3>
                <div class="ai-result-actions">
                    <button class="btn btn-small btn-outline" id="copyAICode">Copy Code</button>
                    <button class="btn btn-small btn-primary" id="useAICode">Use in Editor</button>
                </div>
            </div>
            <div class="code-preview">
                <pre><code>${this.escapeHTML(htmlCode.substring(0, 1000))}${htmlCode.length > 1000 ? '...' : ''}</code></pre>
            </div>
            <div class="ai-result-footer">
                <small>${htmlCode.length} characters • Generated with ${this.aiProviders[this.currentProvider].name}</small>
            </div>
        `;

        // Add event listeners
        setTimeout(() => {
            const copyBtn = document.getElementById('copyAICode');
            const useBtn = document.getElementById('useAICode');

            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(htmlCode);
                    this.uiManager.showToast('Code copied to clipboard!', 'success');
                });
            }

            if (useBtn) {
                useBtn.addEventListener('click', () => {
                    if (window.codeEditor) {
                        window.codeEditor.setCode(htmlCode);
                        this.uiManager.showToast('Code loaded into editor', 'success');
                        
                        // Switch to editor tab
                        const editorTab = document.querySelector('[data-tab="editor"]');
                        if (editorTab) editorTab.click();
                    }
                });
            }
        }, 100);
    }

    escapeHTML(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    optimizeCode(code) {
        // Basic code optimization
        let optimized = code;
        
        // Remove multiple whitespace
        optimized = optimized.replace(/\s+/g, ' ');
        
        // Remove comments
        optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');
        
        // Trim lines
        optimized = optimized.split('\n').map(line => line.trim()).join('\n');
        
        return optimized;
    }

    formatCode(code) {
        // Basic code formatting
        let formatted = code;
        let indentLevel = 0;
        const lines = formatted.split('\n');
        const formattedLines = [];
        
        for (let line of lines) {
            line = line.trim();
            
            // Decrease indent for closing tags
            if (line.match(/^<\/\w+/)) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            // Add current indentation
            formattedLines.push('    '.repeat(indentLevel) + line);
            
            // Increase indent for opening tags (that don't self-close)
            if (line.match(/^<\w+[^>]*>$/)) {
                indentLevel++;
            }
        }
        
        return formattedLines.join('\n');
    }

    validateCode(code) {
        const errors = [];
        
        // Check for basic HTML structure
        if (!code.includes('<html') && !code.includes('<!DOCTYPE')) {
            errors.push('Missing HTML doctype or structure');
        }
        
        if (!code.includes('<body')) {
            errors.push('Missing body tag');
        }
        
        // Check for unclosed tags (basic check)
        const openingTags = (code.match(/<(\w+)[^>]*>/g) || []).length;
        const closingTags = (code.match(/<\/(\w+)>/g) || []).length;
        
        if (openingTags !== closingTags) {
            errors.push(`Tag mismatch: ${openingTags} opening vs ${closingTags} closing tags`);
        }
        
        return {
            valid: errors.length === 0,
            errors,
            warnings: []
        };
    }

    getProviderInfo(providerId) {
        return this.aiProviders[providerId] || this.aiProviders.puter;
    }

    getAllProviders() {
        return Object.values(this.aiProviders);
    }

    getFreeProviders() {
        return Object.values(this.aiProviders).filter(p => p.type === 'free');
    }

    getPaidProviders() {
        return Object.values(this.aiProviders).filter(p => p.type === 'paid');
    }

    testAPIKey(providerId, apiKey) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulated API test
                resolve({
                    valid: apiKey.length > 10,
                    message: apiKey.length > 10 ? 'API key is valid' : 'API key appears invalid'
                });
            }, 1000);
        });
    }

    clearCache() {
        this.cache.clear();
        this.uiManager.showToast('AI cache cleared', 'info');
        this.utils.trackEvent('ai_cache_cleared');
    }

    getStats() {
        return {
            cacheSize: this.cache.size,
            provider: this.currentProvider,
            totalRequests: this.utils.getStorage('ai_requests', 0)
        };
    }
}

// Create global instance
window.aiEngine = new AIEngine();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIEngine;