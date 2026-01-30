// ===== AI ENGINE =====
// Handles AI-powered code generation

// AI System Prompt
const AI_SYSTEM_PROMPT = `You are AppForge AI, an expert full-stack web developer with 15 years of experience building production-ready applications.

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
- Professional color schemes (use CSS variables for theming)
- Smooth animations and transitions
- Accessible (ARIA labels, keyboard navigation)
- Cross-browser compatible

# TECHNICAL REQUIREMENTS:
- Self-contained vanilla JS (no external dependencies unless absolutely necessary)
- Include form validation if forms exist
- Include interactive elements (buttons, modals, etc.)
- Ensure performance (optimized images, lazy loading patterns)
- Add meta tags for SEO when relevant

# OUTPUT FORMAT:
Return ONLY the complete HTML file with embedded CSS and JavaScript.
The file should be ready to run immediately when saved as .html

Example structure:
<!DOCTYPE html>
<html>
<head>
    <meta> tags
    <title>
    <style>/* Complete CSS */</style>
</head>
<body>
    <!-- Complete HTML -->
    <script>/* Complete JS */</script>
</body>
</html>`;

class AIEngine {
    constructor() {
        this.providers = {
            puter: {
                name: 'Puter.js (Grok)',
                free: true,
                endpoint: 'https://api.puter.com/v1/chat/completions'
            },
            openai: {
                name: 'OpenAI GPT-4',
                free: false,
                endpoint: 'https://api.openai.com/v1/chat/completions'
            },
            claude: {
                name: 'Claude 3',
                free: false,
                endpoint: 'https://api.anthropic.com/v1/messages'
            },
            gemini: {
                name: 'Google Gemini',
                free: true,
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
            }
        };
        
        this.currentProvider = 'puter';
        this.apiKeys = {};
        this.cache = new Map();
        
        this.init();
    }
    
    init() {
        // Load API keys from storage
        this.loadAPIKeys();
        
        // Set system prompt in modal
        const promptTextEl = document.getElementById('systemPromptText');
        if (promptTextEl) {
            promptTextEl.textContent = AI_SYSTEM_PROMPT;
        }
        
        console.log('AI Engine initialized');
    }
    
    loadAPIKeys() {
        const savedKeys = StorageManager.get('ai-api-keys', {});
        this.apiKeys = savedKeys;
    }
    
    saveAPIKeys() {
        StorageManager.set('ai-api-keys', this.apiKeys);
    }
    
    setAPIKey(provider, key) {
        this.apiKeys[provider] = key;
        this.saveAPIKeys();
    }
    
    async generateCode(prompt, options = {}) {
        console.log('Generating code with AI...');
        
        // Show loading state
        showToast('AI is generating your app...', 'info');
        
        try {
            let generatedCode;
            
            // Check cache first
            const cacheKey = this.getCacheKey(prompt, options);
            if (this.cache.has(cacheKey)) {
                console.log('Using cached response');
                generatedCode = this.cache.get(cacheKey);
            } else {
                // Generate with AI
                generatedCode = await this.callAI(prompt, options);
                
                // Cache the response
                this.cache.set(cacheKey, generatedCode);
                
                // Limit cache size
                if (this.cache.size > 50) {
                    const firstKey = this.cache.keys().next().value;
                    this.cache.delete(firstKey);
                }
            }
            
            // Validate generated code
            const validatedCode = this.validateCode(generatedCode);
            
            showToast('App generated successfully!', 'success');
            return validatedCode;
            
        } catch (error) {
            console.error('AI generation failed:', error);
            showToast('Failed to generate app. Using fallback template.', 'error');
            
            // Return fallback code
            return this.getFallbackCode(prompt, options);
        }
    }
    
    async callAI(prompt, options) {
        const provider = this.providers[this.currentProvider];
        
        // Prepare the full prompt
        const fullPrompt = this.preparePrompt(prompt, options);
        
        // Simulate API call (replace with actual API call)
        return this.simulateAIResponse(fullPrompt, options);
    }
    
    preparePrompt(userPrompt, options) {
        const features = this.getSelectedFeatures();
        const appType = document.getElementById('appType')?.value || 'custom';
        const colorScheme = document.getElementById('colorScheme')?.value || 'blue';
        
        return `${AI_SYSTEM_PROMPT}

# USER REQUEST:
Application Type: ${appType}
Color Scheme: ${colorScheme}
Required Features: ${features.join(', ')}

# DETAILED DESCRIPTION:
${userPrompt}

# ADDITIONAL REQUIREMENTS:
- Generate mobile-first responsive design
- Include meta tags for PWA support
- Add touch-friendly UI elements
- Ensure fast loading performance
- Make it accessible (WCAG compliant)

Please generate the complete HTML file:`;
    }
    
    getSelectedFeatures() {
        const features = [];
        const checkboxes = document.querySelectorAll('#ai-tab input[type="checkbox"]:checked');
        checkboxes.forEach(cb => {
            features.push(cb.id.replace('feature', ''));
        });
        return features;
    }
    
    async simulateAIResponse(prompt, options) {
        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const appType = options.appType || document.getElementById('appType')?.value || 'task';
        const colorScheme = options.colorScheme || document.getElementById('colorScheme')?.value || 'blue';
        
        // Generate sample app based on type
        return this.generateSampleApp(appType, colorScheme);
    }
    
    generateSampleApp(appType, colorScheme) {
        const colorSchemes = {
            blue: {
                primary: '#4361ee',
                secondary: '#3a0ca3',
                accent: '#4cc9f0',
                background: '#f8f9fa',
                text: '#212529'
            },
            purple: {
                primary: '#7209b7',
                secondary: '#560bad',
                accent: '#b5179e',
                background: '#f8f9fa',
                text: '#212529'
            },
            green: {
                primary: '#2ecc71',
                secondary: '#27ae60',
                accent: '#1abc9c',
                background: '#f8f9fa',
                text: '#2c3e50'
            },
            dark: {
                primary: '#6366f1',
                secondary: '#8b5cf6',
                accent: '#ec4899',
                background: '#0f172a',
                text: '#f1f5f9'
            }
        };
        
        const colors = colorSchemes[colorScheme] || colorSchemes.blue;
        const now = new Date().toLocaleString();
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Mobile app generated by AppForge AI">
    <meta name="theme-color" content="${colors.primary}">
    <title>My ${appType.charAt(0).toUpperCase() + appType.slice(1)} App</title>
    
    <style>
        /* CSS Variables for Theming */
        :root {
            --primary: ${colors.primary};
            --primary-dark: ${this.darkenColor(colors.primary, 20)};
            --secondary: ${colors.secondary};
            --accent: ${colors.accent};
            --background: ${colors.background};
            --text: ${colors.text};
            --text-light: #6c757d;
            --border: #dee2e6;
            --success: #2ecc71;
            --warning: #f39c12;
            --danger: #e74c3c;
            --shadow: 0 4px 6px rgba(0,0,0,0.1);
            --radius: 12px;
            --transition: all 0.3s ease;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
            :root {
                --background: #0f172a;
                --text: #f1f5f9;
                --text-light: #94a3b8;
                --border: #334155;
            }
        }

        /* Reset & Base Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            font-size: 16px;
            -webkit-text-size-adjust: 100%;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background-color: var(--background);
            color: var(--text);
            line-height: 1.6;
            min-height: 100vh;
            padding: env(safe-area-inset-top) env(safe-area-inset-right) 
                     env(safe-area-inset-bottom) env(safe-area-inset-left);
        }

        /* App Container */
        .app-container {
            max-width: 480px;
            margin: 0 auto;
            padding: 20px;
            min-height: 100vh;
        }

        /* Header */
        .app-header {
            padding: 20px 0;
            margin-bottom: 30px;
            text-align: center;
            border-bottom: 1px solid var(--border);
        }

        .app-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 8px;
        }

        .app-subtitle {
            color: var(--text-light);
            font-size: 1rem;
        }

        /* Cards */
        .card {
            background: var(--background);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 24px;
            margin-bottom: 20px;
            box-shadow: var(--shadow);
            transition: var(--transition);
        }

        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }

        .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 12px;
            color: var(--text);
        }

        /* Buttons */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 24px;
            border: none;
            border-radius: var(--radius);
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
            text-decoration: none;
            width: 100%;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(67, 97, 238, 0.3);
        }

        .btn-secondary {
            background-color: transparent;
            border: 2px solid var(--primary);
            color: var(--primary);
        }

        .btn-secondary:hover {
            background-color: var(--primary);
            color: white;
        }

        /* Forms */
        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--text);
        }

        .form-control {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid var(--border);
            border-radius: var(--radius);
            background-color: var(--background);
            color: var(--text);
            font-size: 1rem;
            transition: var(--transition);
        }

        .form-control:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
        }

        /* Navigation */
        .nav-tabs {
            display: flex;
            gap: 4px;
            margin-bottom: 24px;
            border-bottom: 1px solid var(--border);
            padding-bottom: 4px;
        }

        .nav-tab {
            flex: 1;
            padding: 12px;
            background: none;
            border: none;
            color: var(--text-light);
            font-weight: 500;
            cursor: pointer;
            border-radius: var(--radius);
            transition: var(--transition);
        }

        .nav-tab.active {
            background-color: var(--primary);
            color: white;
        }

        /* Stats */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin: 24px 0;
        }

        .stat-card {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border-radius: var(--radius);
            color: white;
        }

        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 4px;
        }

        .stat-label {
            font-size: 0.875rem;
            opacity: 0.9;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .app-container {
                padding: 16px;
            }
            
            .app-title {
                font-size: 1.5rem;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 480px) {
            html {
                font-size: 14px;
            }
            
            .card {
                padding: 16px;
            }
            
            .btn {
                padding: 10px 20px;
            }
        }

        /* Accessibility */
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0,0,0,0);
            border: 0;
        }

        :focus {
            outline: 2px solid var(--primary);
            outline-offset: 2px;
        }

        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .fade-in {
            animation: fadeIn 0.5s ease;
        }

        /* Generated by AppForge AI - ${now} */
    </style>
</head>
<body>
    <div class="app-container fade-in">
        <!-- App Header -->
        <header class="app-header">
            <h1 class="app-title">My ${appType.charAt(0).toUpperCase() + appType.slice(1)} App</h1>
            <p class="app-subtitle">Generated with AppForge AI</p>
        </header>

        <!-- Main Content -->
        <main>
            <!-- Navigation Tabs -->
            <div class="nav-tabs">
                <button class="nav-tab active" data-tab="dashboard">Dashboard</button>
                <button class="nav-tab" data-tab="tasks">Tasks</button>
                <button class="nav-tab" data-tab="settings">Settings</button>
            </div>

            <!-- Dashboard Tab -->
            <div class="tab-content active" id="dashboard-tab">
                <div class="card">
                    <h2 class="card-title">Welcome to Your App</h2>
                    <p style="margin-bottom: 20px; color: var(--text-light);">
                        This is a fully functional mobile app generated by AppForge AI. 
                        It includes responsive design, modern UI components, and interactive features.
                    </p>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">24</div>
                            <div class="stat-label">Active Tasks</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">89%</div>
                            <div class="stat-label">Completion</div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h2 class="card-title">Quick Actions</h2>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button class="btn btn-primary" id="addItemBtn">
                            <i class="fas fa-plus"></i> Add New Item
                        </button>
                        <button class="btn btn-secondary" id="viewStatsBtn">
                            <i class="fas fa-chart-bar"></i> View Statistics
                        </button>
                    </div>
                </div>
            </div>

            <!-- Tasks Tab -->
            <div class="tab-content" id="tasks-tab" style="display: none;">
                <div class="card">
                    <h2 class="card-title">Task Management</h2>
                    
                    <div class="form-group">
                        <label for="taskInput" class="form-label">New Task</label>
                        <input type="text" id="taskInput" class="form-control" placeholder="Enter a new task...">
                    </div>
                    
                    <button class="btn btn-primary" id="addTaskBtn">
                        <i class="fas fa-plus"></i> Add Task
                    </button>
                    
                    <div id="taskList" style="margin-top: 20px;">
                        <!-- Tasks will be added here -->
                    </div>
                </div>
            </div>

            <!-- Settings Tab -->
            <div class="tab-content" id="settings-tab" style="display: none;">
                <div class="card">
                    <h2 class="card-title">App Settings</h2>
                    
                    <div class="form-group">
                        <label class="form-label">Theme</label>
                        <select class="form-control" id="themeSelect">
                            <option value="light">Light Mode</option>
                            <option value="dark">Dark Mode</option>
                            <option value="auto">Auto (System)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Notifications</label>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <input type="checkbox" id="notificationsToggle">
                            <label for="notificationsToggle">Enable push notifications</label>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" id="saveSettingsBtn">
                        <i class="fas fa-save"></i> Save Settings
                    </button>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--border); text-align: center;">
            <p style="color: var(--text-light); font-size: 0.875rem;">
                Generated with ❤️ by AppForge AI
            </p>
        </footer>
    </div>

    <script>
        // App initialization
        document.addEventListener('DOMContentLoaded', function() {
            console.log('App initialized');
            
            // Tab navigation
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    // Update active tab
                    document.querySelectorAll('.nav-tab').forEach(t => {
                        t.classList.remove('active');
                    });
                    this.classList.add('active');
                    
                    // Show corresponding content
                    const tabId = this.getAttribute('data-tab');
                    document.querySelectorAll('.tab-content').forEach(content => {
                        content.style.display = 'none';
                    });
                    document.getElementById(tabId + '-tab').style.display = 'block';
                });
            });
            
            // Add task functionality
            const addTaskBtn = document.getElementById('addTaskBtn');
            const taskInput = document.getElementById('taskInput');
            const taskList = document.getElementById('taskList');
            
            if (addTaskBtn && taskInput && taskList) {
                addTaskBtn.addEventListener('click', function() {
                    const taskText = taskInput.value.trim();
                    if (taskText) {
                        const taskItem = document.createElement('div');
                        taskItem.className = 'task-item';
                        taskItem.style.padding = '12px';
                        taskItem.style.borderBottom = '1px solid var(--border)';
                        taskItem.style.display = 'flex';
                        taskItem.style.alignItems = 'center';
                        taskItem.style.gap = '12px';
                        
                        taskItem.innerHTML = \`
                            <input type="checkbox" style="margin: 0;">
                            <span style="flex: 1;">\${taskText}</span>
                            <button class="delete-task" style="background: none; border: none; color: var(--danger); cursor: pointer;">
                                <i class="fas fa-trash"></i>
                            </button>
                        \`;
                        
                        taskList.appendChild(taskItem);
                        taskInput.value = '';
                        
                        // Add delete functionality
                        taskItem.querySelector('.delete-task').addEventListener('click', function() {
                            taskItem.remove();
                        });
                    }
                });
                
                // Allow Enter key to add task
                taskInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        addTaskBtn.click();
                    }
                });
            }
            
            // Settings functionality
            const saveSettingsBtn = document.getElementById('saveSettingsBtn');
            if (saveSettingsBtn) {
                saveSettingsBtn.addEventListener('click', function() {
                    const theme = document.getElementById('themeSelect').value;
                    const notifications = document.getElementById('notificationsToggle').checked;
                    
                    // In a real app, save to localStorage or backend
                    localStorage.setItem('app-theme', theme);
                    localStorage.setItem('app-notifications', notifications);
                    
                    alert('Settings saved successfully!');
                });
                
                // Load saved settings
                const savedTheme = localStorage.getItem('app-theme') || 'auto';
                const savedNotifications = localStorage.getItem('app-notifications') === 'true';
                
                document.getElementById('themeSelect').value = savedTheme;
                document.getElementById('notificationsToggle').checked = savedNotifications;
            }
            
            // Add item button
            const addItemBtn = document.getElementById('addItemBtn');
            if (addItemBtn) {
                addItemBtn.addEventListener('click', function() {
                    alert('Add item functionality would open a modal here.');
                });
            }
            
            // View stats button
            const viewStatsBtn = document.getElementById('viewStatsBtn');
            if (viewStatsBtn) {
                viewStatsBtn.addEventListener('click', function() {
                    alert('Statistics view would open here.');
                });
            }
            
            // Form validation example
            document.querySelectorAll('.form-control').forEach(input => {
                input.addEventListener('blur', function() {
                    if (this.value.trim() === '' && this.hasAttribute('required')) {
                        this.style.borderColor = 'var(--danger)';
                    } else {
                        this.style.borderColor = 'var(--border)';
                    }
                });
            });
        });
        
        // PWA support
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/service-worker.js');
            });
        }
        
        // Offline detection
        window.addEventListener('online', function() {
            console.log('App is online');
        });
        
        window.addEventListener('offline', function() {
            console.log('App is offline');
            alert('You are offline. Some features may not be available.');
        });
    </script>
    
    <!-- Font Awesome Icons -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>
</body>
</html>`;
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        
        return '#' + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }
    
    validateCode(code) {
        // Basic validation
        if (!code) {
            throw new Error('Generated code is empty');
        }
        
        if (code.length < 100) {
            throw new Error('Generated code is too short');
        }
        
        // Check for required components
        if (!code.includes('<!DOCTYPE html>') && !code.includes('<html')) {
            console.warn('Generated code may not be valid HTML');
        }
        
        return code;
    }
    
    getFallbackCode(prompt, options) {
        // Return a basic template if AI fails
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My App</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            padding: 20px;
        }
        .btn {
            background: #4361ee;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>My App</h1>
        <p>This app was generated by AppForge AI.</p>
        <button class="btn" onclick="alert('Hello!')">Click Me</button>
    </div>
    <script>
        console.log('App loaded successfully');
    </script>
</body>
</html>`;
    }
    
    getCacheKey(prompt, options) {
        return JSON.stringify({
            prompt: prompt.substring(0, 500),
            options: options,
            provider: this.currentProvider
        });
    }
}

// Initialize AI Engine
let aiEngine = null;

async function generateWithAI() {
    if (!aiEngine) {
        aiEngine = new AIEngine();
    }
    
    // Get user input
    const description = document.getElementById('appDescription')?.value || '';
    const appType = document.getElementById('appType')?.value;
    const colorScheme = document.getElementById('colorScheme')?.value;
    
    if (!description.trim()) {
        showToast('Please enter an app description', 'error');
        return;
    }
    
    try {
        // Generate code with AI
        const generatedCode = await aiEngine.generateCode(description, {
            appType,
            colorScheme
        });
        
        // Update editor with generated code
        if (window.setEditorContent) {
            window.setEditorContent(generatedCode);
        }
        
        // Update preview
        if (window.setPreviewContent) {
            window.setPreviewContent(generatedCode);
        }
        
        // Save to app state
        window.AppState.generatedApp = generatedCode;
        
        // Show success message
        showToast('App generated successfully!', 'success');
        
        return generatedCode;
        
    } catch (error) {
        console.error('Generation failed:', error);
        throw error;
    }
}

function initAIEngine() {
    aiEngine = new AIEngine();
    
    // Export functions
    window.generateWithAI = generateWithAI;
    window.aiEngine = aiEngine;
    
    console.log('AI Engine functions exported');
}

// Export
window.initAIEngine = initAIEngine;