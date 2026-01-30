// ===== UI MANAGER =====
// Handles UI components, tabs, modals, and navigation

function initUIManager() {
    console.log('Initializing UI Manager...');
    
    // Initialize all UI components
    initNavigation();
    initTabs();
    initModals();
    initButtons();
    
    // Set up theme
    initTheme();
}

// Navigation management
function initNavigation() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.className = navLinks.classList.contains('active') 
                ? 'fas fa-times' 
                : 'fas fa-bars';
        });
        
        // Close mobile menu when clicking a nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
            });
        });
    }
    
    // Handle section navigation
    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            
            // Update active state
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Handle section switching
            switchSection(section);
        });
    });
}

function switchSection(section) {
    // Hide all sections
    document.querySelectorAll('.app-section').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Show selected section
    const sectionEl = document.querySelector(`.${section}-section`);
    if (sectionEl) {
        sectionEl.classList.remove('hidden');
        sectionEl.scrollIntoView({ behavior: 'smooth' });
    }
}

// Tab management
function initTabs() {
    // Main tabs (AI, Manual, Templates)
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Update tab buttons
            document.querySelectorAll('.tab-btn').forEach(t => {
                t.classList.remove('active');
            });
            tab.classList.add('active');
            
            // Update tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Update app state
            window.AppState.currentTab = tabId;
        });
    });
    
    // Code tabs (HTML, CSS, JS)
    document.querySelectorAll('.code-tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            const codeType = tab.getAttribute('data-code');
            
            // Update tab buttons
            document.querySelectorAll('.code-tab-btn').forEach(t => {
                t.classList.remove('active');
            });
            tab.classList.add('active');
            
            // Update code inputs
            document.querySelectorAll('.code-input').forEach(input => {
                input.classList.remove('active');
            });
            document.getElementById(`${codeType}Code`).classList.add('active');
        });
    });
    
    // Editor tabs
    document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const editorType = tab.getAttribute('data-editor');
            
            // Update tab buttons
            document.querySelectorAll('.editor-tab').forEach(t => {
                t.classList.remove('active');
            });
            tab.classList.add('active');
            
            // Update app state
            window.AppState.currentEditor = editorType;
            
            // Load appropriate content into editor
            loadEditorContent(editorType);
        });
    });
}

function loadEditorContent(type) {
    const editor = document.getElementById('codeEditor');
    if (!editor) return;
    
    // This would load content based on type
    // For now, we'll just update placeholder
    const placeholders = {
        html: '<!-- Your HTML code here -->',
        css: '/* Your CSS code here */',
        js: '// Your JavaScript code here'
    };
    
    editor.placeholder = placeholders[type] || '';
}

// Modal management
function initModals() {
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Close modals with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
    
    // AI System Modal
    const viewPromptBtn = document.getElementById('viewPromptBtn');
    const closeAiModalBtn = document.getElementById('closeAiModalBtn');
    const aiSystemModal = document.getElementById('aiSystemModal');
    
    if (viewPromptBtn && aiSystemModal) {
        viewPromptBtn.addEventListener('click', () => {
            aiSystemModal.classList.add('active');
        });
    }
    
    if (closeAiModalBtn && aiSystemModal) {
        closeAiModalBtn.addEventListener('click', () => {
            aiSystemModal.classList.remove('active');
        });
    }
    
    // Copy prompt button
    const copyPromptBtn = document.getElementById('copyPromptBtn');
    if (copyPromptBtn) {
        copyPromptBtn.addEventListener('click', () => {
            const promptText = document.getElementById('systemPromptText')?.textContent;
            if (promptText) {
                navigator.clipboard.writeText(promptText)
                    .then(() => showToast('System prompt copied to clipboard!', 'success'))
                    .catch(() => showToast('Failed to copy prompt', 'error'));
            }
        });
    }
}

// Button initialization
function initButtons() {
    // Generate button
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            if (window.generateWithAI) {
                generateBtn.disabled = true;
                generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
                
                window.generateWithAI()
                    .finally(() => {
                        generateBtn.disabled = false;
                        generateBtn.innerHTML = '<i class="fas fa-bolt"></i> Generate App with AI';
                    });
            }
        });
    }
    
    // Format code button
    const formatCodeBtn = document.getElementById('formatCodeBtn');
    if (formatCodeBtn && window.formatCode) {
        formatCodeBtn.addEventListener('click', window.formatCode);
    }
    
    // Minify code button
    const minifyCodeBtn = document.getElementById('minifyCodeBtn');
    if (minifyCodeBtn && window.minifyCode) {
        minifyCodeBtn.addEventListener('click', window.minifyCode);
    }
    
    // Preview custom code button
    const previewCustomBtn = document.getElementById('previewCustomBtn');
    if (previewCustomBtn) {
        previewCustomBtn.addEventListener('click', () => {
            // Combine HTML, CSS, and JS for preview
            const html = document.getElementById('htmlCode').value;
            const css = document.getElementById('cssCode').value;
            const js = document.getElementById('jsCode').value;
            
            const combinedCode = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>${css}</style>
                </head>
                <body>
                    ${html}
                    <script>${js}</script>
                </body>
                </html>
            `;
            
            // Update preview
            if (window.updatePreview) {
                window.updatePreview(combinedCode);
                showToast('Custom code preview updated!', 'success');
            }
        });
    }
    
    // Load example button
    const loadExampleBtn = document.getElementById('loadExampleBtn');
    if (loadExampleBtn) {
        loadExampleBtn.addEventListener('click', () => {
            // Load example code
            document.getElementById('htmlCode').value = `<!DOCTYPE html>
<html>
<head>
    <title>My App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
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
    <h1>Welcome to My App</h1>
    <button class="btn" onclick="alert('Hello!')">Click Me</button>
</body>
</html>`;
            
            document.getElementById('cssCode').value = `/* Add your custom CSS here */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.btn-primary {
    background: linear-gradient(135deg, #4361ee, #7209b7);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: transform 0.2s;
}

.btn-primary:hover {
    transform: translateY(-2px);
}`;
            
            document.getElementById('jsCode').value = `// Add your custom JavaScript here
document.addEventListener('DOMContentLoaded', function() {
    console.log('App loaded!');
    
    // Example function
    function showNotification(message) {
        alert(message);
    }
    
    // Make function globally available
    window.showNotification = showNotification;
});`;
            
            showToast('Example code loaded!', 'info');
        });
    }
}

// Theme management
function initTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('appforge-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        window.AppState.darkMode = true;
    }
    
    // Theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            window.AppState.darkMode = !window.AppState.darkMode;
            document.body.classList.toggle('dark-theme', window.AppState.darkMode);
            localStorage.setItem('appforge-theme', window.AppState.darkMode ? 'dark' : 'light');
            
            const icon = themeToggle.querySelector('i');
            icon.className = window.AppState.darkMode ? 'fas fa-sun' : 'fas fa-moon';
            
            showToast(`Switched to ${window.AppState.darkMode ? 'dark' : 'light'} theme`, 'info');
        });
        
        // Set initial icon
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = window.AppState.darkMode ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

// Export UI functions
window.initUIManager = initUIManager;