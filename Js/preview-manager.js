// Preview Manager for AppForge

class PreviewManager {
    constructor() {
        this.utils = window.utils;
        this.uiManager = window.uiManager;
        this.previewFrame = null;
        this.currentSize = 'mobile';
        this.isRefreshing = false;
        this.init();
    }

    init() {
        this.setupPreview();
        this.setupEventListeners();
        this.setupResizeHandler();
    }

    setupPreview() {
        this.previewFrame = document.getElementById('previewFrame');
        if (!this.previewFrame) {
            console.error('Preview frame not found');
            return;
        }

        // Set initial size
        this.setSize(this.currentSize);
    }

    setupEventListeners() {
        // Size buttons
        const sizeButtons = document.querySelectorAll('.size-btn');
        sizeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const size = button.dataset.size;
                this.setSize(size);
                
                // Update active button
                sizeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                this.utils.trackEvent('preview_size_changed', { size });
            });
        });

        // Refresh button
        const refreshBtn = document.getElementById('refreshPreview');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }

        // Auto-refresh on code change
        document.addEventListener('codeUpdated', () => {
            this.debouncedRefresh();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.refresh();
            }
        });
    }

    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    setSize(size) {
        this.currentSize = size;
        const deviceFrame = document.querySelector('.device-frame');
        
        if (!deviceFrame) return;

        switch (size) {
            case 'mobile':
                deviceFrame.style.width = '375px';
                deviceFrame.style.height = '667px';
                deviceFrame.style.transform = 'scale(1)';
                break;
                
            case 'tablet':
                deviceFrame.style.width = '768px';
                deviceFrame.style.height = '1024px';
                deviceFrame.style.transform = 'scale(0.7)';
                break;
                
            case 'desktop':
                deviceFrame.style.width = '1024px';
                deviceFrame.style.height = '768px';
                deviceFrame.style.transform = 'scale(0.8)';
                break;
        }

        this.updateSizeIndicator();
        this.utils.trackEvent('preview_size_set', { size });
    }

    updateSizeIndicator() {
        const indicator = document.querySelector('.size-indicator');
        if (!indicator) return;

        const sizes = {
            mobile: '📱 Mobile (375x667)',
            tablet: '📟 Tablet (768x1024)',
            desktop: '🖥️ Desktop (1024x768)'
        };

        indicator.textContent = sizes[this.currentSize] || sizes.mobile;
    }

    handleResize() {
        // Adjust scale based on container size
        const container = document.querySelector('.preview-frame-container');
        if (!container) return;

        const containerWidth = container.clientWidth;
        const deviceFrame = document.querySelector('.device-frame');
        
        if (!deviceFrame) return;

        const deviceWidth = parseInt(deviceFrame.style.width) || 375;
        const maxScale = containerWidth / deviceWidth;
        const currentScale = parseFloat(deviceFrame.style.transform.replace('scale(', '').replace(')', '')) || 1;

        // Don't scale beyond original size
        if (currentScale > 1 && maxScale < 1) {
            deviceFrame.style.transform = `scale(${Math.min(maxScale, 1)})`;
        }
    }

    refresh() {
        if (this.isRefreshing) return;

        this.isRefreshing = true;
        const refreshBtn = document.getElementById('refreshPreview');
        
        if (refreshBtn) {
            refreshBtn.textContent = '⏳';
            refreshBtn.disabled = true;
        }

        // Get current code from editor
        const code = window.codeEditor ? window.codeEditor.getCode() : '';
        
        // Update preview
        this.updatePreview(code);

        // Show loading animation
        this.showLoading();

        setTimeout(() => {
            this.isRefreshing = false;
            
            if (refreshBtn) {
                refreshBtn.textContent = '🔄';
                refreshBtn.disabled = false;
            }
            
            this.hideLoading();
            this.uiManager.showToast('Preview refreshed', 'success');
            this.utils.trackEvent('preview_refreshed');
        }, 500);
    }

    debouncedRefresh = this.utils.debounce(() => {
        this.refresh();
    }, 1000);

    updatePreview(code) {
        if (!this.previewFrame) return;

        try {
            // Create a complete HTML document
            const html = this.createPreviewHTML(code);
            
            // Write to iframe
            this.previewFrame.srcdoc = html;
            
            // Wait for iframe to load
            this.previewFrame.onload = () => {
                this.injectPreviewHelpers();
                this.setupPreviewInteractions();
            };
        } catch (error) {
            console.error('Preview update error:', error);
            this.uiManager.showToast('Preview update failed', 'error');
        }
    }

    createPreviewHTML(code) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    /* Reset and base styles */
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #fff;
                        min-height: 100vh;
                        overflow-x: hidden;
                    }
                    
                    /* AppForge preview styles */
                    .appforge-preview-marker {
                        position: fixed;
                        bottom: 10px;
                        right: 10px;
                        background: rgba(0,0,0,0.1);
                        padding: 5px 10px;
                        border-radius: 4px;
                        font-size: 12px;
                        color: #666;
                        z-index: 9999;
                        pointer-events: none;
                    }
                    
                    /* Responsive helper */
                    .preview-helper {
                        display: none;
                        position: fixed;
                        top: 10px;
                        left: 10px;
                        background: rgba(0,0,0,0.8);
                        color: white;
                        padding: 5px 10px;
                        border-radius: 4px;
                        font-size: 12px;
                        z-index: 9998;
                    }
                    
                    @media (max-width: 768px) {
                        .preview-helper::after {
                            content: '📱 Mobile View';
                        }
                    }
                    
                    @media (min-width: 769px) and (max-width: 1024px) {
                        .preview-helper::after {
                            content: '📟 Tablet View';
                        }
                    }
                    
                    @media (min-width: 1025px) {
                        .preview-helper::after {
                            content: '🖥️ Desktop View';
                        }
                    }
                    
                    /* Error boundary */
                    .error-boundary {
                        display: none;
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: #fee;
                        border: 2px solid #fcc;
                        border-radius: 8px;
                        padding: 20px;
                        max-width: 90%;
                        z-index: 10000;
                    }
                    
                    .error-boundary.show {
                        display: block;
                    }
                    
                    .error-title {
                        color: #c00;
                        margin-bottom: 10px;
                        font-weight: bold;
                    }
                    
                    .error-message {
                        color: #666;
                        font-family: monospace;
                        font-size: 14px;
                        margin-bottom: 15px;
                        white-space: pre-wrap;
                        word-break: break-word;
                    }
                    
                    .error-retry {
                        background: #c00;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                </style>
                
                <script>
                    // Error handling for preview
                    window.addEventListener('error', function(e) {
                        const errorBoundary = document.getElementById('appforge-error-boundary');
                        if (errorBoundary) {
                            errorBoundary.querySelector('.error-message').textContent = e.message + '\\n' + e.filename + ':' + e.lineno;
                            errorBoundary.classList.add('show');
                        }
                    });
                    
                    window.addEventListener('unhandledrejection', function(e) {
                        const errorBoundary = document.getElementById('appforge-error-boundary');
                        if (errorBoundary) {
                            errorBoundary.querySelector('.error-message').textContent = e.reason?.message || 'Promise rejected';
                            errorBoundary.classList.add('show');
                        }
                    });
                    
                    // Prevent navigation
                    document.addEventListener('click', function(e) {
                        if (e.target.tagName === 'A' && e.target.href) {
                            e.preventDefault();
                            console.log('Link clicked (prevented in preview):', e.target.href);
                        }
                    });
                </script>
            </head>
            <body>
                <!-- Error boundary -->
                <div id="appforge-error-boundary" class="error-boundary">
                    <div class="error-title">⚠️ Preview Error</div>
                    <div class="error-message"></div>
                    <button class="error-retry" onclick="location.reload()">Retry</button>
                </div>
                
                <!-- Preview content -->
                ${code}
                
                <!-- Preview helper -->
                <div class="preview-helper"></div>
                
                <!-- AppForge marker -->
                <div class="appforge-preview-marker">Preview - AppForge</div>
            </body>
            </html>
        `;
    }

    injectPreviewHelpers() {
        if (!this.previewFrame.contentWindow) return;

        try {
            const iframeWindow = this.previewFrame.contentWindow;
            const iframeDocument = iframeWindow.document;

            // Add interactive debugging
            iframeDocument.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' && e.target.href) {
                    e.preventDefault();
                    console.log('🔗 Link clicked (preview):', e.target.href);
                    
                    // Show notification
                    const notification = iframeDocument.createElement('div');
                    notification.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: rgba(0,0,0,0.8);
                        color: white;
                        padding: 10px 20px;
                        border-radius: 5px;
                        z-index: 10000;
                        animation: fadeInOut 3s ease;
                    `;
                    notification.textContent = `Link: ${e.target.href}`;
                    iframeDocument.body.appendChild(notification);
                    
                    setTimeout(() => notification.remove(), 3000);
                }
            });

            // Add element inspector
            iframeDocument.addEventListener('mouseover', (e) => {
                if (e.target === iframeDocument.body) return;
                
                e.target.style.outline = '2px solid #FF3366';
                e.target.style.outlineOffset = '2px';
            });

            iframeDocument.addEventListener('mouseout', (e) => {
                e.target.style.outline = 'none';
            });

            // Add console.log interception
            const originalLog = iframeWindow.console.log;
            iframeWindow.console.log = function(...args) {
                originalLog.apply(iframeWindow.console, args);
                
                // Send logs to parent
                window.parent.postMessage({
                    type: 'preview_console_log',
                    data: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')
                }, '*');
            };

            // Add error reporting
            iframeWindow.addEventListener('error', (e) => {
                window.parent.postMessage({
                    type: 'preview_error',
                    data: {
                        message: e.message,
                        filename: e.filename,
                        lineno: e.lineno,
                        colno: e.colno
                    }
                }, '*');
            });

        } catch (error) {
            console.error('Failed to inject preview helpers:', error);
        }
    }

    setupPreviewInteractions() {
        // Listen for messages from iframe
        window.addEventListener('message', (e) => {
            if (e.data.type === 'preview_console_log') {
                console.log('📱 Preview:', e.data.data);
            } else if (e.data.type === 'preview_error') {
                console.error('📱 Preview Error:', e.data.data);
                this.uiManager.showToast('Preview error detected', 'error');
            }
        });

        // Add click handler to iframe for debugging
        this.previewFrame.addEventListener('load', () => {
            try {
                const iframeDocument = this.previewFrame.contentDocument;
                if (iframeDocument) {
                    iframeDocument.addEventListener('click', (e) => {
                        console.log('Preview element clicked:', e.target);
                    });
                }
            } catch (error) {
                // Cross-origin restriction
            }
        });
    }

    showLoading() {
        const previewContainer = document.querySelector('.preview-section');
        if (!previewContainer) return;

        // Remove existing loader
        const existingLoader = previewContainer.querySelector('.preview-loader');
        if (existingLoader) existingLoader.remove();

        // Create loader
        const loader = document.createElement('div');
        loader.className = 'preview-loader';
        loader.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 100;
            background: rgba(255,255,255,0.9);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            text-align: center;
        `;
        loader.innerHTML = `
            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #FF3366; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
            <div>Refreshing preview...</div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;

        previewContainer.style.position = 'relative';
        previewContainer.appendChild(loader);
    }

    hideLoading() {
        const loader = document.querySelector('.preview-loader');
        if (loader) loader.remove();
    }

    // Screenshot functionality
    captureScreenshot() {
        return new Promise((resolve, reject) => {
            if (!this.previewFrame.contentWindow) {
                reject(new Error('Preview frame not ready'));
                return;
            }

            try {
                const iframeWindow = this.previewFrame.contentWindow;
                const iframeDocument = iframeWindow.document;

                html2canvas(iframeDocument.body, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff'
                }).then(canvas => {
                    const imageData = canvas.toDataURL('image/png');
                    resolve(imageData);
                }).catch(reject);

            } catch (error) {
                reject(error);
            }
        });
    }

    downloadScreenshot(filename = 'appforge-preview.png') {
        this.captureScreenshot()
            .then(imageData => {
                const link = document.createElement('a');
                link.href = imageData;
                link.download = filename;
                link.click();
                
                this.uiManager.showToast(`Screenshot saved as ${filename}`, 'success');
                this.utils.trackEvent('screenshot_captured', { filename });
            })
            .catch(error => {
                this.uiManager.showToast('Failed to capture screenshot', 'error');
                console.error('Screenshot error:', error);
            });
    }

    // Preview actions
    openInNewTab() {
        const code = window.codeEditor ? window.codeEditor.getCode() : '';
        const html = this.createPreviewHTML(code);
        
        const newWindow = window.open();
        newWindow.document.write(html);
        newWindow.document.close();
        
        this.uiManager.showToast('Opened in new tab', 'info');
        this.utils.trackEvent('preview_opened_in_new_tab');
    }

    toggleDeviceFrame() {
        const deviceFrame = document.querySelector('.device-frame');
        if (deviceFrame) {
            const isVisible = deviceFrame.style.display !== 'none';
            deviceFrame.style.display = isVisible ? 'none' : 'block';
            
            this.uiManager.showToast(
                isVisible ? 'Device frame hidden' : 'Device frame shown',
                'info'
            );
            this.utils.trackEvent('device_frame_toggled', { visible: !isVisible });
        }
    }

    toggleHelpers() {
        const helpers = document.querySelectorAll('.preview-helper, .appforge-preview-marker');
        const isVisible = helpers[0]?.style.display !== 'none';
        
        helpers.forEach(helper => {
            helper.style.display = isVisible ? 'none' : 'block';
        });
        
        this.uiManager.showToast(
            isVisible ? 'Helpers hidden' : 'Helpers shown',
            'info'
        );
        this.utils.trackEvent('preview_helpers_toggled', { visible: !isVisible });
    }

    // Performance monitoring
    measurePerformance() {
        if (!this.previewFrame.contentWindow) return;

        const iframeWindow = this.previewFrame.contentWindow;
        const timing = iframeWindow.performance?.timing;
        
        if (timing) {
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
            
            this.uiManager.showModal(
                'Preview Performance',
                `
                <div class="performance-stats">
                    <p><strong>Load Time:</strong> ${loadTime}ms</p>
                    <p><strong>DOM Ready:</strong> ${domReadyTime}ms</p>
                    <p><strong>Page Size:</strong> ${this.previewFrame.contentDocument?.documentElement.outerHTML.length || 0} bytes</p>
                    <p><strong>Elements:</strong> ${this.previewFrame.contentDocument?.querySelectorAll('*').length || 0}</p>
                </div>
                `
            );
            
            this.utils.trackEvent('performance_measured', { loadTime, domReadyTime });
        }
    }

    // Responsive testing
    testResponsive() {
        const breakpoints = [
            { name: 'Mobile Small', width: 320 },
            { name: 'Mobile Medium', width: 375 },
            { name: 'Mobile Large', width: 425 },
            { name: 'Tablet', width: 768 },
            { name: 'Laptop', width: 1024 },
            { name: 'Desktop', width: 1440 }
        ];

        let currentIndex = 0;

        const testNextBreakpoint = () => {
            if (currentIndex >= breakpoints.length) {
                this.setSize('mobile'); // Reset to default
                this.uiManager.showToast('Responsive test completed', 'success');
                return;
            }

            const breakpoint = breakpoints[currentIndex];
            this.setCustomSize(breakpoint.width, 800);
            
            this.uiManager.showModal(
                'Responsive Testing',
                `
                <div class="responsive-test">
                    <h4>Testing: ${breakpoint.name}</h4>
                    <p>Width: ${breakpoint.width}px</p>
                    <p>${currentIndex + 1} of ${breakpoints.length}</p>
                    <div class="test-controls">
                        <button class="btn btn-outline" onclick="previewManager.setSize('mobile'); uiManager.closeModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="uiManager.closeModal(); setTimeout(() => previewManager.continueResponsiveTest(), 1000)">Next</button>
                    </div>
                </div>
                `,
                { footer: '' }
            );
            
            currentIndex++;
        };

        // Start test
        testNextBreakpoint();
    }

    continueResponsiveTest = this.testResponsive;

    setCustomSize(width, height) {
        const deviceFrame = document.querySelector('.device-frame');
        if (!deviceFrame) return;

        deviceFrame.style.width = `${width}px`;
        deviceFrame.style.height = `${height}px`;
        
        // Calculate scale to fit container
        const container = document.querySelector('.preview-frame-container');
        if (container) {
            const containerWidth = container.clientWidth;
            const scale = Math.min(containerWidth / width, 1);
            deviceFrame.style.transform = `scale(${scale})`;
        }
    }

    // Preview sharing
    generateShareableLink() {
        const code = window.codeEditor ? window.codeEditor.getCode() : '';
        if (!code.trim()) {
            this.uiManager.showToast('No code to share', 'warning');
            return;
        }

        // Compress code (simple base64 for demo)
        const compressed = btoa(encodeURIComponent(code));
        const shareUrl = `${window.location.origin}${window.location.pathname}#preview=${compressed}`;
        
        this.uiManager.showModal(
            'Share Preview',
            `
            <div class="share-preview">
                <p>Copy this link to share your preview:</p>
                <input type="text" readonly value="${shareUrl}" style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">
                <div class="share-actions">
                    <button class="btn btn-outline" onclick="navigator.clipboard.writeText('${shareUrl}'); uiManager.showToast('Link copied!', 'success')">Copy Link</button>
                    <button class="btn btn-primary" onclick="window.open('${shareUrl}', '_blank')">Open Link</button>
                </div>
            </div>
            `
        );
        
        this.utils.trackEvent('share_link_generated');
    }

    // Load from share link
    loadFromShareLink(compressedCode) {
        try {
            const code = decodeURIComponent(atob(compressedCode));
            if (window.codeEditor) {
                window.codeEditor.setCode(code);
                this.uiManager.showToast('Preview loaded from share link', 'success');
                this.utils.trackEvent('share_link_loaded');
            }
        } catch (error) {
            this.uiManager.showToast('Invalid share link', 'error');
        }
    }

    // Check for share link on load
    checkForShareLink() {
        const hash = window.location.hash;
        const match = hash.match(/#preview=(.+)/);
        
        if (match) {
            this.loadFromShareLink(match[1]);
        }
    }
}

// Create global instance
window.previewManager = new PreviewManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PreviewManager;
}
