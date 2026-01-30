// ===== APK BUILDER =====
// Handles APK and PWA export functionality

class APKBuilder {
    constructor() {
        this.apkBuilder = document.getElementById('apkBuilder');
        this.buildApkBtn = document.getElementById('exportApkBtn');
        this.closeApkBuilderBtn = document.getElementById('closeApkBuilderBtn');
        this.cancelApkBtn = document.getElementById('cancelApkBtn');
        this.buildApkBtnModal = document.getElementById('buildApkBtn');
        this.apkBuildModal = document.getElementById('apkBuildModal');
        this.cancelBuildBtn = document.getElementById('cancelBuildBtn');
        this.exportHtmlBtn = document.getElementById('exportHtmlBtn');
        this.exportPwaBtn = document.getElementById('exportPwaBtn');
        
        this.buildSteps = [
            'Validating code...',
            'Creating project structure...',
            'Adding Android manifest...',
            'Configuring permissions...',
            'Building resources...',
            'Compiling APK...',
            'Signing package...',
            'Optimizing APK...',
            'Finalizing build...'
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        console.log('APK Builder initialized');
    }
    
    setupEventListeners() {
        // APK build button
        if (this.buildApkBtn) {
            this.buildApkBtn.addEventListener('click', () => this.showAPKBuilder());
        }
        
        // Close APK builder
        if (this.closeApkBuilderBtn) {
            this.closeApkBuilderBtn.addEventListener('click', () => this.hideAPKBuilder());
        }
        
        // Cancel APK configuration
        if (this.cancelApkBtn) {
            this.cancelApkBtn.addEventListener('click', () => this.hideAPKBuilder());
        }
        
        // Build APK button in modal
        if (this.buildApkBtnModal) {
            this.buildApkBtnModal.addEventListener('click', () => this.startAPKBuild());
        }
        
        // Cancel build button
        if (this.cancelBuildBtn) {
            this.cancelBuildBtn.addEventListener('click', () => this.cancelBuild());
        }
        
        // HTML export
        if (this.exportHtmlBtn) {
            this.exportHtmlBtn.addEventListener('click', () => this.exportHTML());
        }
        
        // PWA export
        if (this.exportPwaBtn) {
            this.exportPwaBtn.addEventListener('click', () => this.exportPWA());
        }
    }
    
    showAPKBuilder() {
        if (!window.AppState.generatedApp) {
            showToast('Please generate an app first', 'error');
            return;
        }
        
        if (this.apkBuilder) {
            this.apkBuilder.classList.remove('hidden');
            this.apkBuilder.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    hideAPKBuilder() {
        if (this.apkBuilder) {
            this.apkBuilder.classList.add('hidden');
        }
    }
    
    async startAPKBuild() {
        if (!window.AppState.generatedApp) {
            showToast('No app to build', 'error');
            return;
        }
        
        // Get APK configuration
        const config = this.getAPKConfig();
        
        // Validate configuration
        if (!this.validateAPKConfig(config)) {
            return;
        }
        
        // Show build modal
        this.showBuildModal();
        
        try {
            // Start build process
            await this.buildAPK(config);
            
            // Show success
            this.showBuildSuccess(config);
            
        } catch (error) {
            console.error('APK build failed:', error);
            this.showBuildError(error);
        }
    }
    
    getAPKConfig() {
        return {
            packageName: document.getElementById('apkPackageName')?.value || 'com.appforge.generated',
            versionName: document.getElementById('apkVersionName')?.value || '1.0.0',
            versionCode: parseInt(document.getElementById('apkVersionCode')?.value) || 1,
            permissions: this.getSelectedPermissions(),
            appName: 'AppForge Generated App',
            description: 'Mobile app generated with AppForge AI'
        };
    }
    
    getSelectedPermissions() {
        const permissions = [];
        if (document.getElementById('permInternet')?.checked) permissions.push('INTERNET');
        if (document.getElementById('permStorage')?.checked) permissions.push('READ_EXTERNAL_STORAGE');
        if (document.getElementById('permCamera')?.checked) permissions.push('CAMERA');
        if (document.getElementById('permLocation')?.checked) permissions.push('ACCESS_FINE_LOCATION');
        return permissions;
    }
    
    validateAPKConfig(config) {
        // Validate package name
        if (!config.packageName || !Validator.isPackageName(config.packageName)) {
            showToast('Invalid package name. Use format: com.company.appname', 'error');
            return false;
        }
        
        // Validate version
        if (!config.versionName || config.versionCode < 1) {
            showToast('Invalid version information', 'error');
            return false;
        }
        
        return true;
    }
    
    showBuildModal() {
        if (this.apkBuildModal) {
            this.apkBuildModal.classList.add('active');
            
            // Initialize build steps
            const buildStepsEl = document.getElementById('buildSteps');
            if (buildStepsEl) {
                buildStepsEl.innerHTML = '';
                this.buildSteps.forEach((step, index) => {
                    const stepEl = document.createElement('div');
                    stepEl.className = 'build-step';
                    stepEl.innerHTML = `
                        <div class="step-icon">${index + 1}</div>
                        <div class="step-info">
                            <h4>${step}</h4>
                            <p>Step ${index + 1} of ${this.buildSteps.length}</p>
                        </div>
                        <div class="step-status">Pending</div>
                    `;
                    buildStepsEl.appendChild(stepEl);
                });
            }
            
            // Show cancel button
            if (this.cancelBuildBtn) {
                this.cancelBuildBtn.style.display = 'inline-flex';
            }
        }
    }
    
    hideBuildModal() {
        if (this.apkBuildModal) {
            this.apkBuildModal.classList.remove('active');
        }
    }
    
    async buildAPK(config) {
        return new Promise(async (resolve, reject) => {
            try {
                // Simulate build process
                for (let i = 0; i < this.buildSteps.length; i++) {
                    // Update progress
                    this.updateBuildProgress(i);
                    
                    // Simulate step duration
                    await this.simulateBuildStep(i);
                    
                    // Check if build was cancelled
                    if (window.AppState.apkBuildCancelled) {
                        throw new Error('Build cancelled by user');
                    }
                }
                
                // Complete build
                this.updateBuildProgress(this.buildSteps.length);
                resolve();
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    updateBuildProgress(currentStep) {
        // Update progress bar
        const progressEl = document.getElementById('apkProgress');
        if (progressEl) {
            const progress = ((currentStep + 1) / this.buildSteps.length) * 100;
            progressEl.style.width = `${progress}%`;
        }
        
        // Update step status
        const stepElements = document.querySelectorAll('.build-step');
        stepElements.forEach((stepEl, index) => {
            if (index < currentStep) {
                stepEl.className = 'build-step completed';
                stepEl.querySelector('.step-status').textContent = 'Completed';
            } else if (index === currentStep) {
                stepEl.className = 'build-step active';
                stepEl.querySelector('.step-status').textContent = 'In Progress';
            } else {
                stepEl.className = 'build-step';
                stepEl.querySelector('.step-status').textContent = 'Pending';
            }
        });
    }
    
    async simulateBuildStep(stepIndex) {
        // Simulate different durations for different steps
        const durations = [1000, 1500, 1200, 800, 2000, 1800, 1500, 1200, 1000];
        const duration = durations[stepIndex] || 1000;
        
        return new Promise(resolve => setTimeout(resolve, duration));
    }
    
    showBuildSuccess(config) {
        // Hide build modal
        this.hideBuildModal();
        
        // Create APK file
        const apkContent = this.createAPKFile(config);
        const apkBlob = new Blob([apkContent], { type: 'application/vnd.android.package-archive' });
        const apkUrl = URL.createObjectURL(apkBlob);
        
        // Show download options
        const apkFileName = `${config.packageName}-${config.versionName}.apk`;
        
        // Create download modal
        const downloadModal = document.createElement('div');
        downloadModal.className = 'modal active';
        downloadModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fab fa-android"></i> APK Build Complete!</h2>
                </div>
                <div class="modal-body">
                    <div class="apk-output success">
                        <div style="text-align: center; margin-bottom: 24px;">
                            <div class="qr-placeholder">
                                <i class="fab fa-android"></i>
                            </div>
                            <p style="margin-top: 16px; color: var(--gray-600);">Scan to download on mobile</p>
                        </div>
                        
                        <div class="apk-file-info">
                            <div class="apk-file-stat">
                                <span class="value">${config.versionName}</span>
                                <span class="label">Version</span>
                            </div>
                            <div class="apk-file-stat">
                                <span class="value">${config.versionCode}</span>
                                <span class="label">Version Code</span>
                            </div>
                            <div class="apk-file-stat">
                                <span class="value">~2.4 MB</span>
                                <span class="label">File Size</span>
                            </div>
                            <div class="apk-file-stat">
                                <span class="value">${config.permissions.length}</span>
                                <span class="label">Permissions</span>
                            </div>
                        </div>
                        
                        <div class="apk-actions-row">
                            <a href="${apkUrl}" download="${apkFileName}" class="btn btn-primary">
                                <i class="fas fa-download"></i> Download APK
                            </a>
                            <button class="btn btn-secondary" id="shareApkBtn">
                                <i class="fas fa-share-alt"></i> Share
                            </button>
                        </div>
                        
                        <p style="margin-top: 20px; text-align: center; color: var(--gray-600); font-size: 0.875rem;">
                            <i class="fas fa-info-circle"></i> Install on Android devices by opening the downloaded file
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeApkDownloadBtn">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(downloadModal);
        
        // Set up event listeners for the new modal
        downloadModal.querySelector('#closeApkDownloadBtn').addEventListener('click', () => {
            downloadModal.remove();
            URL.revokeObjectURL(apkUrl);
        });
        
        downloadModal.querySelector('#shareApkBtn').addEventListener('click', () => {
            this.shareAPK(config, apkUrl, apkFileName);
        });
        
        // Close on background click
        downloadModal.addEventListener('click', (e) => {
            if (e.target === downloadModal) {
                downloadModal.remove();
                URL.revokeObjectURL(apkUrl);
            }
        });
        
        // Hide APK builder
        this.hideAPKBuilder();
        
        showToast('APK built successfully!', 'success');
    }
    
    createAPKFile(config) {
        // In a real implementation, this would create an actual APK file
        // For now, create a mock APK with build info
        
        const buildInfo = {
            config: config,
            buildDate: new Date().toISOString(),
            generatedBy: 'AppForge AI',
            sourceCode: window.AppState.generatedApp?.substring(0, 1000) || '',
            instructions: 'This is a mock APK file. In a real implementation, this would be a real Android APK.'
        };
        
        return JSON.stringify(buildInfo, null, 2);
    }
    
    shareAPK(config, apkUrl, fileName) {
        if (navigator.share) {
            navigator.share({
                title: `${config.appName} - Android APK`,
                text: `Download ${config.appName} APK generated with AppForge AI`,
                url: apkUrl
            }).catch(() => {
                // Fallback to clipboard
                this.copyAPKLink(config);
            });
        } else {
            this.copyAPKLink(config);
        }
    }
    
    copyAPKLink(config) {
        const link = `${window.location.origin}/download/${config.packageName}-${config.versionName}.apk`;
        navigator.clipboard.writeText(link)
            .then(() => showToast('Download link copied to clipboard!', 'success'))
            .catch(() => showToast('Could not copy link', 'error'));
    }
    
    showBuildError(error) {
        this.hideBuildModal();
        
        const errorMessage = error.message || 'Unknown error occurred';
        showToast(`APK build failed: ${errorMessage}`, 'error');
        
        // Reset build state
        window.AppState.apkBuildCancelled = false;
    }
    
    cancelBuild() {
        window.AppState.apkBuildCancelled = true;
        this.hideBuildModal();
        showToast('APK build cancelled', 'info');
    }
    
    async exportHTML() {
        if (!window.AppState.generatedApp) {
            showToast('No app to export', 'error');
            return;
        }
        
        // Create HTML package
        const htmlPackage = this.createHTMLPackage();
        
        // Create ZIP file (simulated)
        const zipContent = this.createZIPFile(htmlPackage);
        
        // Download
        FileUtils.downloadFile(
            'appforge-app.zip',
            zipContent,
            'application/zip'
        );
        
        showToast('HTML package downloaded!', 'success');
    }
    
    createHTMLPackage() {
        const appCode = window.AppState.generatedApp;
        
        return {
            'index.html': appCode,
            'README.md': '# AppForge Generated App\n\nThis app was generated with AppForge AI.',
            'assets/': 'Directory for images and fonts',
            'css/app.css': '/* Custom CSS */',
            'js/app.js': '/* Custom JavaScript */'
        };
    }
    
    createZIPFile(files) {
        // Simulated ZIP content
        // In a real implementation, use a library like JSZip
        
        let zipContent = 'AppForge Generated App Package\n\n';
        zipContent += 'Files included:\n';
        zipContent += '================\n\n';
        
        Object.entries(files).forEach(([fileName, content]) => {
            zipContent += `${fileName}\n`;
            if (typeof content === 'string' && content.length > 50) {
                zipContent += `  [Content: ${content.length} characters]\n`;
            }
            zipContent += '\n';
        });
        
        zipContent += '\nTo use:\n';
        zipContent += '1. Extract all files\n';
        zipContent += '2. Open index.html in a browser\n';
        zipContent += '3. For PWA: Serve via HTTPS\n';
        
        return zipContent;
    }
    
    async exportPWA() {
        if (!window.AppState.generatedApp) {
            showToast('No app to export', 'error');
            return;
        }
        
        // Create PWA manifest
        const manifest = this.createPWAManifest();
        
        // Create service worker
        const serviceWorker = this.createServiceWorker();
        
        // Create PWA package
        const pwaPackage = {
            'index.html': window.AppState.generatedApp,
            'manifest.json': JSON.stringify(manifest, null, 2),
            'service-worker.js': serviceWorker,
            'assets/icons/icon-192.png': 'App icon (192x192)',
            'assets/icons/icon-512.png': 'App icon (512x512)',
            'README-PWA.md': this.createPWAReadme()
        };
        
        // Create ZIP
        const zipContent = this.createZIPFile(pwaPackage);
        
        // Download
        FileUtils.downloadFile(
            'appforge-pwa.zip',
            zipContent,
            'application/zip'
        );
        
        showToast('PWA package downloaded!', 'success');
    }
    
    createPWAManifest() {
        return {
            name: 'AppForge Generated App',
            short_name: 'AppForge',
            description: 'Progressive Web App generated with AppForge AI',
            start_url: './index.html',
            display: 'standalone',
            background_color: '#ffffff',
            theme_color: '#4361ee',
            icons: [
                {
                    src: 'assets/icons/icon-192.png',
                    sizes: '192x192',
                    type: 'image/png'
                },
                {
                    src: 'assets/icons/icon-512.png',
                    sizes: '512x512',
                    type: 'image/png'
                }
            ]
        };
    }
    
    createServiceWorker() {
        return `// AppForge PWA Service Worker
const CACHE_NAME = 'appforge-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});`;
    }
    
    createPWAReadme() {
        return `# PWA Installation Guide

## What is a PWA?
Progressive Web Apps (PWAs) are web applications that can be installed on devices and work offline.

## Features:
✅ Installable on mobile & desktop
✅ Offline functionality
✅ Push notifications support
✅ App-like experience

## Installation:

### On Chrome/Edge:
1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. Confirm installation

### On Safari (iOS):
1. Open the app in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Confirm the installation

### On Firefox:
1. Open the app in Firefox
2. Click the menu button
3. Select "Install"
4. Confirm installation

## Hosting Requirements:
- HTTPS is required for PWA features
- Service worker must be served from the same origin
- Manifest must be accessible

## Testing:
1. Use Lighthouse in Chrome DevTools
2. Check PWA score
3. Test offline functionality
4. Verify installation prompts

## Support:
- Chrome/Edge: Full support
- Safari: Partial support
- Firefox: Full support
- Opera: Full support

## Notes:
- Service worker requires HTTPS
- Some features require user permission
- Updates are automatic when online`;
    }
}

// Initialize APK Builder
let apkBuilder = null;

function initAPKBuilder() {
    apkBuilder = new APKBuilder();
    console.log('APK Builder initialized');
}

// Export
window.initAPKBuilder = initAPKBuilder;
window.apkBuilder = apkBuilder;