// AppForge Main Application
// Ties together all modules and handles the main app logic

const AppForge = {
    // App version
    version: '3.0.0',

    // Initialize the application
    init() {
        console.log(`AppForge v${this.version} initializing...`);

        // Initialize all modules
        this.initializeModules();

        // Setup main event listeners
        this.setupEventListeners();

        // Check for saved code
        this.loadSavedCode();

        // Update UI state
        this.updateUIState();

        console.log('AppForge initialized successfully!');
    },

    // Initialize all modules
    initializeModules() {
        // Utils is auto-initialized
        // UIManager is auto-initialized
        // UserManager is auto-initialized
        // LicenseManager is auto-initialized
        // TemplateManager is auto-initialized
        // CodeEditor is auto-initialized
        // PreviewManager is auto-initialized
        // AIEngine is auto-initialized
        // APKBuilder is auto-initialized
    },

    // Setup main event listeners
    setupEventListeners() {
        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                UIManager.openModal('settingsModal');
            });
        }

        // Close settings buttons
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => {
                UIManager.closeModal('settingsModal');
            });
        }

        const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
        if (cancelSettingsBtn) {
            cancelSettingsBtn.addEventListener('click', () => {
                UIManager.closeModal('settingsModal');
            });
        }

        // Save settings button
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // Generate button
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateApp();
            });
        }

        // Demo button
        const demoBtn = document.getElementById('demoBtn');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => {
                this.generateDemoApp();
            });
        }

        // Copy button
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                CodeEditor.copyCode();
            });
        }

        // Download button
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                CodeEditor.downloadCode();
            });
        }

        // Test button
        const testBtn = document.getElementById('testBtn');
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                CodeEditor.testInNewTab();
            });
        }

        // AI System button
        const aiSystemBtn = document.getElementById('aiSystemBtn');
        if (aiSystemBtn) {
            aiSystemBtn.addEventListener('click', () => {
                UIManager.openModal('settingsModal');
                // Switch to AI settings tab
                document.querySelector('.settings-tab[data-setting="ai"]')?.click();
            });
        }

        // User menu button
        const userMenuBtn = document.getElementById('userMenuBtn');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', () => {
                UIManager.openModal('settingsModal');
                // Switch to account tab
                document.querySelector('.settings-tab[data-setting="account"]')?.click();
            });
        }

        // Template buttons in AI panel
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const template = e.currentTarget.dataset.template;
                TemplateManager.useTemplate(template);
            });
        });

        // Auto-save code on change
        const codeEditor = document.getElementById('codeEditor');
        if (codeEditor) {
            codeEditor.addEventListener('input', Utils.debounce(() => {
                this.saveCode();
            }, 1000));
        }

        // Window beforeunload - save state
        window.addEventListener('beforeunload', () => {
            this.saveCode();
        });
    },

    // Generate app with AI
    async generateApp() {
        const promptField = document.getElementById('appPrompt');
        const prompt = promptField?.value?.trim();

        if (!prompt) {
            UIManager.toast('Please describe what you want to build!', 'error');
            return;
        }

        // Check AI connection
        const isConnected = await AIEngine.checkConnection();
        if (!isConnected && AIEngine.settings.provider === 'puter') {
            UIManager.toast('AI not ready yet. Using demo mode...', 'warning');
            this.generateDemoApp();
            return;
        }

        // Get options
        const options = {
            appType: document.getElementById('appType')?.value || 'webapp',
            colorScheme: document.getElementById('colorScheme')?.value || 'blue',
            features: {
                responsive: document.getElementById('featResponsive')?.checked ?? true,
                animations: document.getElementById('featAnimations')?.checked ?? false,
                darkMode: document.getElementById('featDarkMode')?.checked ?? false,
                pwa: document.getElementById('featPWA')?.checked ?? false
            }
        };

        // Show loading
        const generateBtn = document.getElementById('generateBtn');
        const originalText = generateBtn.innerHTML;
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

        try {
            UIManager.toast('AI is generating your app...', 'info');

            // Generate with AI
            const code = await AIEngine.generate(prompt, options);

            // Set code in editor
            CodeEditor.setCode(code);

            // Update preview
            PreviewManager.refresh();

            // Track usage
            UserManager.trackUsage('aiGenerations');

            UIManager.toast('App generated successfully!', 'success');

        } catch (error) {
            console.error('Generation error:', error);
            UIManager.toast(`Error: ${error.message}. Try demo mode.`, 'error');
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = originalText;
        }
    },

    // Generate demo app
    async generateDemoApp() {
        const promptField = document.getElementById('appPrompt');
        const prompt = promptField?.value?.trim() || 'Create a simple landing page';

        const demoCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AppForge Demo App</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
            padding: 40px 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        
        header {
            text-align: center;
            margin-bottom: 50px;
        }
        
        h1 {
            font-size: 3.5rem;
            margin-bottom: 16px;
            background: linear-gradient(45deg, #FF3366, #3366FF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .subtitle {
            font-size: 1.25rem;
            opacity: 0.9;
        }
        
        .prompt-box {
            background: rgba(0,0,0,0.2);
            padding: 24px;
            border-radius: 16px;
            margin-bottom: 40px;
            border-left: 4px solid #4CAF50;
        }
        
        .prompt-box h3 {
            margin-bottom: 12px;
            color: #4CAF50;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
            margin: 40px 0;
        }
        
        .feature {
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 16px;
            text-align: center;
            transition: transform 0.3s, background 0.3s;
        }
        
        .feature:hover {
            transform: translateY(-8px);
            background: rgba(255,255,255,0.15);
        }
        
        .feature i {
            font-size: 3rem;
            margin-bottom: 16px;
            color: #00D1FF;
        }
        
        .feature h3 {
            font-size: 1.25rem;
            margin-bottom: 8px;
        }
        
        .cta {
            text-align: center;
            margin-top: 50px;
        }
        
        .cta-button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(45deg, #FF3366, #9933FF);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 600;
            transition: transform 0.3s, box-shadow 0.3s;
            border: none;
            cursor: pointer;
        }
        
        .cta-button:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 30px rgba(255, 51, 102, 0.4);
        }
        
        footer {
            text-align: center;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid rgba(255,255,255,0.1);
            opacity: 0.7;
        }
        
        @media (max-width: 768px) {
            h1 { font-size: 2.5rem; }
            .features { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1><i class="fas fa-rocket"></i> Your AppForge App</h1>
            <p class="subtitle">This demo app was generated based on your prompt!</p>
        </header>
        
        <div class="prompt-box">
            <h3><i class="fas fa-lightbulb"></i> Your Prompt:</h3>
            <p>${prompt}</p>
        </div>
        
        <div class="features">
            <div class="feature">
                <i class="fas fa-mobile-alt"></i>
                <h3>Responsive</h3>
                <p>Works on all devices</p>
            </div>
            <div class="feature">
                <i class="fas fa-bolt"></i>
                <h3>Fast</h3>
                <p>Lightning performance</p>
            </div>
            <div class="feature">
                <i class="fas fa-code"></i>
                <h3>Clean Code</h3>
                <p>Well-structured HTML</p>
            </div>
            <div class="feature">
                <i class="fas fa-paint-brush"></i>
                <h3>Beautiful</h3>
                <p>Modern design</p>
            </div>
        </div>
        
        <div class="cta">
            <button class="cta-button" onclick="celebrate()">
                <i class="fas fa-magic"></i> Launch Your App
            </button>
        </div>
        
        <footer>
            <p>Built with <i class="fas fa-heart" style="color: #FF3366;"></i> by AppForge</p>
        </footer>
    </div>
    
    <script>
        function celebrate() {
            // Confetti effect
            const colors = ['#FF3366', '#3366FF', '#00D1FF', '#4CAF50', '#FFD700'];
            for (let i = 0; i < 50; i++) {
                setTimeout(() => {
                    const confetti = document.createElement('div');
                    confetti.style.cssText = \`
                        position: fixed;
                        width: 12px;
                        height: 12px;
                        background: \${colors[Math.floor(Math.random() * colors.length)]};
                        border-radius: 50%;
                        left: \${Math.random() * 100}vw;
                        top: -20px;
                        z-index: 9999;
                        pointer-events: none;
                    \`;
                    document.body.appendChild(confetti);
                    
                    confetti.animate([
                        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                        { transform: 'translateY(100vh) rotate(720deg)', opacity: 0 }
                    ], {
                        duration: 2000 + Math.random() * 1000,
                        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                    }).onfinish = () => confetti.remove();
                }, i * 30);
            }
            
            setTimeout(() => {
                alert('\\u2728 Your app is ready! Edit the code to customize it further.');
            }, 500);
        }
    </script>
</body>
</html>`;

        // Set code
        CodeEditor.setCode(demoCode);

        // Update preview
        PreviewManager.refresh();

        UIManager.toast('Demo app generated!', 'success');
    },

    // Save settings
    saveSettings() {
        // Save AI settings
        AIEngine.updateSettings({
            provider: document.getElementById('aiProvider')?.value || 'puter',
            apiKey: document.getElementById('apiKey')?.value || '',
            model: document.getElementById('aiModel')?.value || '',
            cacheEnabled: document.getElementById('cacheResponses')?.checked ?? true,
            autoFormat: document.getElementById('autoFormat')?.checked ?? true
        });

        // Save editor settings
        Utils.storage.set('appforge_editorTheme', document.getElementById('editorTheme')?.value || 'vs-dark');
        Utils.storage.set('appforge_fontSize', document.getElementById('fontSize')?.value || 14);
        Utils.storage.set('appforge_tabSize', document.getElementById('tabSize')?.value || 4);
        Utils.storage.set('appforge_wordWrap', document.getElementById('wordWrap')?.checked ?? true);
        Utils.storage.set('appforge_lineNumbers', document.getElementById('lineNumbers')?.checked ?? true);

        UIManager.closeModal('settingsModal');
        UIManager.toast('Settings saved!', 'success');

        // Recheck connection
        AIEngine.checkConnection();
    },

    // Save code to storage
    saveCode() {
        const code = CodeEditor.getCode();
        if (code) {
            Utils.storage.set('appforge_currentCode', code);
        }
    },

    // Load saved code
    loadSavedCode() {
        const savedCode = Utils.storage.get('appforge_currentCode');
        if (savedCode) {
            CodeEditor.setCode(savedCode);
        }
    },

    // Update UI state
    updateUIState() {
        // Update user info
        UserManager.updateUsageUI();

        // Update license info
        LicenseManager.updateLicenseUI();

        // Update export history
        UserManager.updateExportHistoryUI();
    },

    // Get app info
    getInfo() {
        return {
            version: this.version,
            user: UserManager.getState(),
            aiProvider: AIEngine.getSettings().provider
        };
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AppForge.init();
});

// Make available globally
window.AppForge = AppForge;
