// ===== PREVIEW MANAGER =====
// Handles live preview functionality

class PreviewManager {
    constructor() {
        this.previewFrame = document.getElementById('previewFrame');
        this.deviceSelector = document.getElementById('deviceSelector');
        this.refreshPreviewBtn = document.getElementById('refreshPreviewBtn');
        this.fullscreenPreviewBtn = document.getElementById('fullscreenPreviewBtn');
        this.deviceFrame = document.querySelector('.device-frame');
        
        this.currentContent = '';
        this.isFullscreen = false;
        
        this.init();
    }
    
    init() {
        if (!this.previewFrame) {
            console.warn('Preview frame not found');
            return;
        }
        
        this.setupEventListeners();
        this.updatePreviewStats();
        
        console.log('Preview manager initialized');
    }
    
    setupEventListeners() {
        // Device selector
        if (this.deviceSelector) {
            this.deviceSelector.addEventListener('change', (e) => {
                this.setDeviceSize(e.target.value);
            });
        }
        
        // Refresh preview
        if (this.refreshPreviewBtn) {
            this.refreshPreviewBtn.addEventListener('click', () => {
                this.refreshPreview();
            });
        }
        
        // Fullscreen preview
        if (this.fullscreenPreviewBtn) {
            this.fullscreenPreviewBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
        
        // Auto-refresh on code changes
        const codeEditor = document.getElementById('codeEditor');
        if (codeEditor) {
            codeEditor.addEventListener('input', debounce(() => {
                if (window.AppState.userSettings.autoPreview) {
                    this.updatePreview();
                }
            }, 1000));
        }
    }
    
    setDeviceSize(device) {
        if (!this.deviceFrame) return;
        
        const sizes = {
            mobile: { width: '375px', height: '667px' },
            tablet: { width: '768px', height: '1024px' },
            desktop: { width: '100%', height: '600px' }
        };
        
        const size = sizes[device] || sizes.mobile;
        
        this.deviceFrame.style.width = size.width;
        this.deviceFrame.style.height = size.height;
        this.deviceFrame.setAttribute('data-device', device);
        
        // Update preview frame size
        if (this.previewFrame) {
            this.previewFrame.style.height = device === 'desktop' 
                ? '100%' 
                : `calc(100% - ${device === 'mobile' ? '80px' : '60px'})`;
        }
        
        showToast(`Switched to ${device} view`, 'info');
    }
    
    updatePreview(content = null) {
        if (!this.previewFrame) return;
        
        // Use provided content or get from editor
        if (content) {
            this.currentContent = content;
        } else {
            this.currentContent = this.getCombinedCode();
        }
        
        // Create complete HTML document for preview
        const previewDoc = this.createPreviewDocument(this.currentContent);
        
        // Update iframe
        this.previewFrame.srcdoc = previewDoc;
        
        // Update stats
        this.updatePreviewStats();
        
        console.log('Preview updated');
    }
    
    getCombinedCode() {
        // Get code from current editor or combine from all sources
        const editorType = window.AppState.currentEditor;
        const editorContent = document.getElementById('codeEditor')?.value || '';
        
        // If we're in manual mode, combine HTML/CSS/JS
        if (window.AppState.currentTab === 'manual') {
            const html = document.getElementById('htmlCode')?.value || '';
            const css = document.getElementById('cssCode')?.value || '';
            const js = document.getElementById('jsCode')?.value || '';
            
            return this.createCompleteHTML(html, css, js);
        }
        
        // Otherwise use editor content as complete HTML
        return editorContent;
    }
    
    createCompleteHTML(html, css, js) {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AppForge Preview</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
        ${css}
    </style>
</head>
<body>
    ${html}
    <script>
        // Prevent navigation
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                console.log('Link clicked:', e.target.href);
            }
        });
        
        // Handle form submissions
        document.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Form submitted');
            alert('Form submission handled in preview mode');
        });
        
        ${js}
    </script>
</body>
</html>`;
    }
    
    createPreviewDocument(content) {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base target="_blank">
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }
        
        .preview-notice {
            background: linear-gradient(135deg, #4361ee, #7209b7);
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        
        .preview-notice strong {
            display: block;
            margin-bottom: 5px;
            font-size: 16px;
        }
        
        /* Disable external links in preview */
        a[href^="http"]:not([href*="localhost"]) {
            opacity: 0.7;
            pointer-events: none;
            text-decoration: line-through;
        }
        
        /* Style forms for preview */
        input, button, textarea, select {
            font-family: inherit;
            font-size: inherit;
        }
        
        /* Add some basic styles if none provided */
        :not(style):not(link):not(meta):not(title) {
            min-height: 1px;
        }
    </style>
</head>
<body>
    <div class="preview-notice">
        <strong>AppForge Live Preview</strong>
        Interactive preview of your generated application. Forms and links are simulated.
    </div>
    ${content}
    
    <script>
        // Enhanced preview script
        (function() {
            // Log all console messages to parent
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            
            console.log = function(...args) {
                originalLog.apply(console, args);
                window.parent.postMessage({ 
                    type: 'console', 
                    level: 'log', 
                    args: args.map(arg => 
                        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                    )
                }, '*');
            };
            
            console.error = function(...args) {
                originalError.apply(console, args);
                window.parent.postMessage({ 
                    type: 'console', 
                    level: 'error', 
                    args: args.map(String)
                }, '*');
            };
            
            console.warn = function(...args) {
                originalWarn.apply(console, args);
                window.parent.postMessage({ 
                    type: 'console', 
                    level: 'warn', 
                    args: args.map(String)
                }, '*');
            };
            
            // Handle form submissions
            document.addEventListener('submit', function(e) {
                e.preventDefault();
                const form = e.target;
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                console.log('Form submitted:', data);
                
                // Show success message
                alert('Form submitted successfully!\\n\\nIn preview mode, forms are simulated.');
                
                // Reset form
                form.reset();
            });
            
            // Handle link clicks
            document.addEventListener('click', function(e) {
                if (e.target.tagName === 'A') {
                    e.preventDefault();
                    const href = e.target.getAttribute('href');
                    
                    if (href && href !== '#') {
                        console.log('Link clicked:', href);
                        
                        if (href.startsWith('http')) {
                            alert('External links are disabled in preview mode.\\n\\nLink: ' + href);
                        } else {
                            // Try to navigate internally
                            const target = document.querySelector(href);
                            if (target) {
                                target.scrollIntoView({ behavior: 'smooth' });
                            }
                        }
                    }
                }
            });
            
            // Add loading state to buttons
            document.addEventListener('click', function(e) {
                if (e.target.tagName === 'BUTTON' && !e.target.hasAttribute('data-preview-processed')) {
                    const button = e.target;
                    const originalText = button.textContent;
                    
                    button.setAttribute('data-preview-processed', 'true');
                    button.textContent = 'Processing...';
                    button.disabled = true;
                    
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.disabled = false;
                        button.removeAttribute('data-preview-processed');
                        alert('Button action completed in preview mode');
                    }, 1000);
                }
            });
            
            // Initialize any components that need it
            document.dispatchEvent(new Event('DOMContentLoaded'));
            
            console.log('Preview environment initialized');
        })();
    </script>
</body>
</html>`;
    }
    
    refreshPreview() {
        this.updatePreview();
        showToast('Preview refreshed!', 'info');
    }
    
    toggleFullscreen() {
        if (!this.previewFrame) return;
        
        const previewContainer = this.previewFrame.closest('.preview-container');
        
        if (!this.isFullscreen) {
            // Enter fullscreen
            previewContainer.style.position = 'fixed';
            previewContainer.style.top = '0';
            previewContainer.style.left = '0';
            previewContainer.style.width = '100vw';
            previewContainer.style.height = '100vh';
            previewContainer.style.zIndex = '9999';
            previewContainer.style.backgroundColor = 'white';
            previewContainer.style.padding = '0';
            
            this.deviceFrame.style.display = 'none';
            this.previewFrame.style.width = '100%';
            this.previewFrame.style.height = '100%';
            this.previewFrame.style.borderRadius = '0';
            
            this.isFullscreen = true;
            this.fullscreenPreviewBtn.innerHTML = '<i class="fas fa-compress"></i>';
            showToast('Entered fullscreen preview mode', 'info');
        } else {
            // Exit fullscreen
            previewContainer.style.position = '';
            previewContainer.style.top = '';
            previewContainer.style.left = '';
            previewContainer.style.width = '';
            previewContainer.style.height = '';
            previewContainer.style.zIndex = '';
            previewContainer.style.backgroundColor = '';
            previewContainer.style.padding = '';
            
            const device = this.deviceSelector?.value || 'mobile';
            this.setDeviceSize(device);
            this.deviceFrame.style.display = '';
            
            this.isFullscreen = false;
            this.fullscreenPreviewBtn.innerHTML = '<i class="fas fa-expand"></i>';
            showToast('Exited fullscreen preview mode', 'info');
        }
    }
    
    updatePreviewStats() {
        // Update line count
        const lineCountEl = document.getElementById('lineCount');
        if (lineCountEl) {
            const lines = this.currentContent.split('\n').length;
            lineCountEl.textContent = `${lines} lines`;
        }
        
        // Update file size
        const fileSizeEl = document.getElementById('fileSize');
        if (fileSizeEl) {
            const size = new Blob([this.currentContent]).size;
            fileSizeEl.textContent = FileUtils.formatFileSize(size);
        }
        
        // Update load time (simulated)
        const loadTimeEl = document.getElementById('loadTime');
        if (loadTimeEl) {
            const loadTime = Math.max(50, Math.min(500, this.currentContent.length / 1000));
            loadTimeEl.textContent = `${Math.round(loadTime)}ms`;
        }
    }
    
    getCurrentContent() {
        return this.currentContent;
    }
    
    setCurrentContent(content) {
        this.currentContent = content;
        this.updatePreview(content);
    }
}

// Initialize preview manager
let previewManager = null;

function initPreviewManager() {
    previewManager = new PreviewManager();
    
    // Export functions to global scope
    window.updatePreview = (content) => previewManager.updatePreview(content);
    window.refreshPreview = () => previewManager.refreshPreview();
    window.getPreviewContent = () => previewManager.getCurrentContent();
    window.setPreviewContent = (content) => previewManager.setCurrentContent(content);
    
    console.log('Preview manager functions exported');
}

// Export
window.initPreviewManager = initPreviewManager;
window.previewManager = previewManager;

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}