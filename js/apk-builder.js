// APK Builder for AppForge
class APKBuilder {
    constructor() {
        this.utils = window.utils;
        this.uiManager = window.uiManager;
        this.licenseManager = window.licenseManager;
        this.currentBuild = null;
        this.buildQueue = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadBuildHistory();
    }

    setupEventListeners() {
        // Export buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('export-btn')) {
                const exportType = e.target.closest('.export-card').dataset.export;
                this.handleExport(exportType);
            }
        });

        // Upgrade buttons
        const upgradeBtns = document.querySelectorAll('#upgradeLicenseBtn, #upgradeAccountBtn');
        upgradeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.showUpgradeModal());
        });
    }

    handleExport(exportType) {
        const code = window.codeEditor ? window.codeEditor.getCode() : '';
        
        if (!code.trim()) {
            this.uiManager.showToast('Please create or load an app first', 'warning');
            return;
        }

        switch(exportType) {
            case 'html':
                this.exportHTML(code);
                break;
            case 'pwa':
                this.exportPWA(code);
                break;
            case 'apk':
                this.exportAPK(code);
                break;
            case 'ios':
                this.showComingSoon();
                break;
        }
    }

    exportHTML(code) {
        const filename = this.generateFilename('app', 'html');
        this.utils.downloadFile(filename, code, 'text/html');
        
        this.utils.trackEvent('export_html', { length: code.length });
        this.uiManager.showToast(`HTML exported as ${filename}`, 'success');
        
        // Update user stats
        this.incrementExportCount('html');
    }

    exportPWA(code) {
        // Check export limits for free tier
        if (!this.licenseManager.canExport('pwa')) {
            this.showUpgradeModal('PWA exports');
            return;
        }

        this.uiManager.showModal(
            'PWA Package Builder',
            this.getPWABuilderHTML(),
            { footer: this.getPWABuilderFooter() }
        );

        // Initialize PWA builder
        setTimeout(() => this.initPWABuilder(code), 100);
    }

    getPWABuilderHTML() {
        return `
            <div class="pwa-builder">
                <div class="build-step active">
                    <h4>📱 PWA Configuration</h4>
                    <div class="app-config-form">
                        <div class="form-group">
                            <label for="pwaName">App Name</label>
                            <input type="text" id="pwaName" value="My App" placeholder="Enter your app name">
                        </div>
                        <div class="form-group">
                            <label for="pwaShortName">Short Name</label>
                            <input type="text" id="pwaShortName" value="App" placeholder="Short name for homescreen">
                        </div>
                        <div class="form-group">
                            <label for="pwaDescription">Description</label>
                            <textarea id="pwaDescription" placeholder="Describe your app">A Progressive Web App created with AppForge</textarea>
                        </div>
                        <div class="form-group">
                            <label for="pwaThemeColor">Theme Color</label>
                            <input type="color" id="pwaThemeColor" value="#667eea">
                        </div>
                        <div class="form-group">
                            <label for="pwaBackgroundColor">Background Color</label>
                            <input type="color" id="pwaBackgroundColor" value="#ffffff">
                        </div>
                        <div class="icon-preview">
                            <div class="icon-display">A</div>
                            <small>App Icon Preview</small>
                        </div>
                    </div>
                </div>
                <div class="build-progress" style="display: none;">
                    <h4>🔄 Building PWA Package</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" id="pwaProgress" style="width: 0%"></div>
                    </div>
                    <div class="progress-steps">
                        <div class="progress-step active">Preparing</div>
                        <div class="progress-step">Generating</div>
                        <div class="progress-step">Packaging</div>
                        <div class="progress-step">Complete</div>
                    </div>
                    <div class="build-log" id="pwaBuildLog"></div>
                </div>
                <div class="download-section" style="display: none;" id="pwaDownloadSection"></div>
            </div>
        `;
    }

    getPWABuilderFooter() {
        return `
            <button class="btn btn-outline" onclick="uiManager.closeModal()">Cancel</button>
            <button class="btn btn-primary" id="buildPWABtn">Build PWA Package</button>
        `;
    }

    initPWABuilder(code) {
        const buildBtn = document.getElementById('buildPWABtn');
        if (buildBtn) {
            buildBtn.addEventListener('click', () => this.buildPWAPackage(code));
        }

        // Theme color preview
        const themeColor = document.getElementById('pwaThemeColor');
        const iconPreview = document.querySelector('.icon-display');
        
        if (themeColor && iconPreview) {
            themeColor.addEventListener('input', (e) => {
                iconPreview.style.backgroundColor = e.target.value;
            });
            iconPreview.style.backgroundColor = themeColor.value;
        }
    }

    async buildPWAPackage(code) {
        const config = this.getPWAConfig();
        const buildBtn = document.getElementById('buildPWABtn');
        
        if (buildBtn) buildBtn.disabled = true;

        // Show progress
        document.querySelector('.build-step').classList.remove('active');
        document.querySelector('.build-progress').style.display = 'block';
        
        const steps = ['Preparing files...', 'Generating manifest...', 'Creating service worker...', 'Packaging files...', 'Finalizing...'];
        const log = document.getElementById('pwaBuildLog');
        const progressFill = document.getElementById('pwaProgress');
        
        for (let i = 0; i < steps.length; i++) {
            this.updateProgress(log, progressFill, steps[i], (i + 1) * 20);
            await this.delay(500);
        }

        // Create PWA package
        const pwaPackage = this.createPWAPackage(code, config);
        const zipBlob = await this.createZipFile(pwaPackage);
        
        // Show download section
        document.querySelector('.build-progress').style.display = 'none';
        const downloadSection = document.getElementById('pwaDownloadSection');
        downloadSection.style.display = 'block';
        downloadSection.innerHTML = `
            <h4>✅ PWA Package Ready!</h4>
            <div class="pwa-file">
                <div class="pwa-info">
                    <h5>${config.name}.zip</h5>
                    <p>Complete PWA package with all necessary files</p>
                </div>
                <a href="#" class="download-btn" id="downloadPWABtn">📥 Download ZIP</a>
            </div>
            <div class="pwa-instructions">
                <h5>Installation Instructions:</h5>
                <ol>
                    <li>Extract the ZIP file to your web server</li>
                    <li>Access the app via HTTPS</li>
                    <li>Users can install it to their homescreen</li>
                </ol>
            </div>
        `;

        // Set up download
        setTimeout(() => {
            const downloadBtn = document.getElementById('downloadPWABtn');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.downloadBlob(zipBlob, `${config.shortName || 'pwa'}.zip`);
                    
                    // Update license usage
                    this.licenseManager.recordExport('pwa');
                    
                    this.utils.trackEvent('pwa_exported', {
                        name: config.name,
                        size: zipBlob.size
                    });
                    
                    this.uiManager.showToast('PWA package downloaded!', 'success');
                    this.incrementExportCount('pwa');
                    
                    // Close modal after delay
                    setTimeout(() => this.uiManager.closeModal(), 2000);
                });
            }
        }, 100);
    }

    getPWAConfig() {
        return {
            name: document.getElementById('pwaName')?.value || 'My App',
            shortName: document.getElementById('pwaShortName')?.value || 'App',
            description: document.getElementById('pwaDescription')?.value || 'PWA created with AppForge',
            themeColor: document.getElementById('pwaThemeColor')?.value || '#667eea',
            backgroundColor: document.getElementById('pwaBackgroundColor')?.value || '#ffffff',
            version: '1.0.0',
            author: 'AppForge User'
        };
    }

    createPWAPackage(code, config) {
        const manifest = {
            name: config.name,
            short_name: config.shortName,
            description: config.description,
            start_url: '/',
            display: 'standalone',
            background_color: config.backgroundColor,
            theme_color: config.themeColor,
            icons: [
                {
                    src: '/icon-192.png',
                    sizes: '192x192',
                    type: 'image/png'
                },
                {
                    src: '/icon-512.png',
                    sizes: '512x512',
                    type: 'image/png'
                }
            ]
        };

        const serviceWorker = `
// AppForge Service Worker
const CACHE_NAME = 'appforge-pwa-${Date.now()}';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/style.css',
    '/app.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});

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
});
        `;

        const readme = `
# ${config.name}

${config.description}

## Created with AppForge
- Generated: ${new Date().toISOString()}
- Version: ${config.version}
- Author: ${config.author}

## Installation
1. Upload all files to your web server
2. Ensure HTTPS is enabled
3. Access the app via browser
4. Install to homescreen when prompted

## Files Included
- index.html - Main application
- manifest.json - PWA manifest
- service-worker.js - Service worker for offline support
- README.md - This file

## Support
For questions or issues, visit AppForge documentation.
        `;

        return {
            'index.html': code,
            'manifest.json': JSON.stringify(manifest, null, 2),
            'service-worker.js': serviceWorker,
            'README.md': readme,
            'assets/': null, // Directory placeholder
            'assets/icons/': null
        };
    }

    exportAPK(code) {
        // Check if user can export APK
        if (!this.licenseManager.canExport('apk')) {
            this.showUpgradeModal('APK exports');
            return;
        }

        // Show APK builder modal
        this.uiManager.showModal(
            'Android APK Builder',
            this.getAPKBuilderHTML(),
            { footer: this.getAPKBuilderFooter() }
        );

        // Initialize APK builder
        setTimeout(() => this.initAPKBuilder(code), 100);
    }

    getAPKBuilderHTML() {
        return `
            <div class="apk-builder">
                <div class="build-step active">
                    <h4>🤖 APK Configuration</h4>
                    <div class="app-config-form">
                        <div class="form-group">
                            <label for="apkName">App Name</label>
                            <input type="text" id="apkName" value="My App" placeholder="Enter your app name">
                        </div>
                        <div class="form-group">
                            <label for="apkPackage">Package Name</label>
                            <input type="text" id="apkPackage" value="com.appforge.myapp" placeholder="com.company.appname">
                        </div>
                        <div class="form-group">
                            <label for="apkVersion">Version</label>
                            <input type="text" id="apkVersion" value="1.0.0" placeholder="1.0.0">
                        </div>
                        <div class="form-group">
                            <label for="apkVersionCode">Version Code</label>
                            <input type="number" id="apkVersionCode" value="1" min="1">
                        </div>
                        <div class="form-group">
                            <label for="apkIcon">App Icon</label>
                            <div class="icon-preview">
                                <div class="icon-display">A</div>
                                <small>Drag & drop or click to upload icon</small>
                                <input type="file" id="apkIcon" accept="image/png" style="display: none;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="apkPermissions">Permissions</label>
                            <div class="permissions-list">
                                <label><input type="checkbox" name="permission" value="INTERNET" checked disabled> Internet</label>
                                <label><input type="checkbox" name="permission" value="ACCESS_NETWORK_STATE"> Network State</label>
                                <label><input type="checkbox" name="permission" value="VIBRATE"> Vibrate</label>
                                <label><input type="checkbox" name="permission" value="CAMERA"> Camera</label>
                                <label><input type="checkbox" name="permission" value="RECORD_AUDIO"> Microphone</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="license-required" style="display: none;" id="apkLicenseCheck">
                    <h4>🔒 License Required</h4>
                    <p>APK export is a Pro feature. Upgrade to unlock unlimited APK builds.</p>
                    <div class="payment-options">
                        <div class="payment-option" data-plan="single">
                            <div class="payment-icon">💎</div>
                            <h5>Single APK</h5>
                            <p>One-time export</p>
                            <div class="price-tag">$4.99</div>
                        </div>
                        <div class="payment-option" data-plan="pro">
                            <div class="payment-icon">🚀</div>
                            <h5>Pro Plan</h5>
                            <p>Unlimited APKs + more</p>
                            <div class="price-tag">$19/mo</div>
                        </div>
                    </div>
                </div>
                <div class="build-progress" style="display: none;">
                    <h4>🔨 Building APK</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" id="apkProgress" style="width: 0%"></div>
                    </div>
                    <div class="progress-steps">
                        <div class="progress-step active">Preparing</div>
                        <div class="progress-step">Compiling</div>
                        <div class="progress-step">Packaging</div>
                        <div class="progress-step">Signing</div>
                        <div class="progress-step">Complete</div>
                    </div>
                    <div class="build-log" id="apkBuildLog"></div>
                </div>
                <div class="download-section" style="display: none;" id="apkDownloadSection"></div>
            </div>
        `;
    }

    getAPKBuilderFooter() {
        return `
            <button class="btn btn-outline" onclick="uiManager.closeModal()">Cancel</button>
            <button class="btn btn-primary" id="buildAPKBtn">Build APK</button>
        `;
    }

    initAPKBuilder(code) {
        const buildBtn = document.getElementById('buildAPKBtn');
        if (buildBtn) {
            buildBtn.addEventListener('click', () => this.buildAPKPackage(code));
        }

        // Icon upload
        const iconInput = document.getElementById('apkIcon');
        const iconPreview = document.querySelector('.icon-display');
        
        if (iconInput && iconPreview) {
            iconPreview.addEventListener('click', () => iconInput.click());
            iconInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        iconPreview.style.backgroundImage = `url(${e.target.result})`;
                        iconPreview.style.backgroundSize = 'cover';
                        iconPreview.textContent = '';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Payment option selection
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
    }

    async buildAPKPackage(code) {
        // Check license again
        if (!this.licenseManager.canExport('apk')) {
            document.querySelector('.build-step').style.display = 'none';
            document.getElementById('apkLicenseCheck').style.display = 'block';
            return;
        }

        const config = this.getAPKConfig();
        const buildBtn = document.getElementById('buildAPKBtn');
        
        if (buildBtn) buildBtn.disabled = true;

        // Show progress
        document.querySelector('.build-step').style.display = 'none';
        document.querySelector('.build-progress').style.display = 'block';
        
        const steps = [
            'Preparing files...',
            'Setting up WebView...',
            'Compiling resources...',
            'Packaging APK...',
            'Signing application...',
            'Finalizing build...'
        ];
        
        const log = document.getElementById('apkBuildLog');
        const progressFill = document.getElementById('apkProgress');
        
        for (let i = 0; i < steps.length; i++) {
            this.updateProgress(log, progressFill, steps[i], (i + 1) * (100 / steps.length));
            await this.delay(800);
        }

        // Create simulated APK file
        const apkBlob = await this.createSimulatedAPK(code, config);
        
        // Show download section
        document.querySelector('.build-progress').style.display = 'none';
        const downloadSection = document.getElementById('apkDownloadSection');
        downloadSection.style.display = 'block';
        downloadSection.innerHTML = `
            <h4>✅ APK Build Complete!</h4>
            <div class="apk-file">
                <div class="apk-info">
                    <h5>${config.name.replace(/\s+/g, '_')}.apk</h5>
                    <p>Android APK - Ready to install</p>
                    <small>Version ${config.version} (${config.versionCode})</small>
                </div>
                <a href="#" class="download-btn" id="downloadAPKBtn">📱 Download APK</a>
            </div>
            <div class="qr-container">
                <h5>📲 Scan to Install (Simulated)</h5>
                <div class="qr-code">
                    <div style="text-align: center; padding: 20px;">
                        <div style="font-size: 3em;">📱</div>
                        <div style="margin-top: 10px; font-size: 0.9em;">APK Ready</div>
                    </div>
                </div>
                <p class="qr-instructions">In a real build, this would be a QR code to download the APK</p>
            </div>
            <div class="apk-instructions">
                <h5>Installation Instructions:</h5>
                <ol>
                    <li>Download the APK file to your Android device</li>
                    <li>Enable "Install from unknown sources" in settings</li>
                    <li>Open the downloaded APK file</li>
                    <li>Tap "Install" when prompted</li>
                </ol>
            </div>
        `;

        // Set up download
        setTimeout(() => {
            const downloadBtn = document.getElementById('downloadAPKBtn');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.downloadBlob(apkBlob, `${config.name.replace(/\s+/g, '_')}.apk`);
                    
                    // Update license usage
                    this.licenseManager.recordExport('apk');
                    
                    this.utils.trackEvent('apk_exported', {
                        name: config.name,
                        version: config.version,
                        size: apkBlob.size
                    });
                    
                    this.uiManager.showToast('APK downloaded! (Simulated)', 'success');
                    this.incrementExportCount('apk');
                    
                    // Close modal after delay
                    setTimeout(() => this.uiManager.closeModal(), 3000);
                });
            }
        }, 100);
    }

    getAPKConfig() {
        return {
            name: document.getElementById('apkName')?.value || 'My App',
            package: document.getElementById('apkPackage')?.value || 'com.appforge.myapp',
            version: document.getElementById('apkVersion')?.value || '1.0.0',
            versionCode: document.getElementById('apkVersionCode')?.value || '1',
            permissions: Array.from(document.querySelectorAll('input[name="permission"]:checked'))
                .map(input => input.value)
        };
    }

    async createSimulatedAPK(code, config) {
        // Create a simulated APK file (in production, this would use Capacitor/Cordova)
        const apkContent = `
APK Simulation for: ${config.name}
Package: ${config.package}
Version: ${config.version} (${config.versionCode})
Permissions: ${config.permissions.join(', ')}
Build Date: ${new Date().toISOString()}
Generated by: AppForge

This is a simulated APK file. In production, this would be a real Android APK file
built using Capacitor or Cordova that wraps your web app in a WebView.

Your app code (${code.length} characters) would be embedded here.

To get real APK export, connect AppForge to a build server with Capacitor.
        `;

        return new Blob([apkContent], { type: 'application/vnd.android.package-archive' });
    }

    showComingSoon() {
        this.uiManager.showModal(
            'Coming Soon 🚀',
            `
            <div class="coming-soon">
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 4em;">🍎</div>
                    <h3>iOS Export Coming Soon!</h3>
                    <p>We're working hard to bring iOS app export to AppForge.</p>
                    <p>This feature requires Apple Developer account integration and will be available in the next update.</p>
                    <div class="features-list">
                        <h4>Planned Features:</h4>
                        <ul>
                            <li>iOS App Store deployment</li>
                            <li>Xcode project generation</li>
                            <li>App Store Connect integration</li>
                            <li>TestFlight distribution</li>
                        </ul>
                    </div>
                </div>
            </div>
            `
        );
    }

    showUpgradeModal(feature = 'This feature') {
        this.uiManager.showModal(
            'Upgrade Required 🔒',
            `
            <div class="upgrade-required">
                <h4>${feature} requires Pro plan</h4>
                <p>Upgrade to unlock unlimited exports and advanced features.</p>
                
                <div class="plan-comparison">
                    <div class="plan-card free">
                        <h5>Free Plan</h5>
                        <div class="price">$0/month</div>
                        <ul>
                            <li>✓ Unlimited AI generations</li>
                            <li>✓ Basic templates</li>
                            <li>✓ 3 PWA exports/month</li>
                            <li>✗ APK export</li>
                            <li>✗ Remove branding</li>
                            <li>✗ Priority support</li>
                        </ul>
                    </div>
                    
                    <div class="plan-card pro">
                        <h5>Pro Plan</h5>
                        <div class="price">$19/month</div>
                        <ul>
                            <li>✓ Unlimited AI generations</li>
                            <li>✓ All templates</li>
                            <li>✓ Unlimited PWA exports</li>
                            <li>✓ 10 APK exports/month</li>
                            <li>✓ Remove branding</li>
                            <li>✓ Priority support</li>
                        </ul>
                    </div>
                </div>
                
                <div class="payment-actions">
                    <button class="btn btn-primary" id="upgradeNowBtn">Upgrade Now</button>
                    <button class="btn btn-outline" onclick="uiManager.closeModal()">Maybe Later</button>
                </div>
            </div>
            `
        );

        setTimeout(() => {
            const upgradeBtn = document.getElementById('upgradeNowBtn');
            if (upgradeBtn) {
                upgradeBtn.addEventListener('click', () => {
                    this.uiManager.showToast('Upgrade functionality coming soon!', 'info');
                    this.utils.trackEvent('upgrade_clicked', { feature });
                });
            }
        }, 100);
    }

    updateProgress(logElement, progressElement, message, progress) {
        if (logElement) {
            const timestamp = new Date().toLocaleTimeString();
            logElement.innerHTML += `<div class="log-entry info">[${timestamp}] ${message}</div>`;
            logElement.scrollTop = logElement.scrollHeight;
        }
        
        if (progressElement) {
            progressElement.style.width = `${progress}%`;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async createZipFile(files) {
        // Simulated zip creation (in production, use JSZip library)
        const fileList = Object.keys(files).filter(key => files[key] !== null);
        const zipContent = `Simulated ZIP containing: ${fileList.join(', ')}`;
        return new Blob([zipContent], { type: 'application/zip' });
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateFilename(base, extension) {
        const timestamp = new Date().toISOString().split('T')[0];
        const random = Math.random().toString(36).substring(2, 8);
        return `${base}-${timestamp}-${random}.${extension}`;
    }

    incrementExportCount(type) {
        const stats = this.utils.getStorage('export_stats', { html: 0, pwa: 0, apk: 0 });
        stats[type] = (stats[type] || 0) + 1;
        this.utils.setStorage('export_stats', stats);
        
        // Update UI if available
        const countElement = document.getElementById(`${type}Exports`);
        if (countElement) {
            countElement.textContent = stats[type];
        }
    }

    loadBuildHistory() {
        this.buildQueue = this.utils.getStorage('build_queue', []);
    }

    saveBuildHistory() {
        this.utils.setStorage('build_queue', this.buildQueue);
    }

    addToBuildQueue(build) {
        this.buildQueue.push({
            ...build,
            id: this.utils.randomId(8),
            createdAt: new Date().toISOString(),
            status: 'pending'
        });
        this.saveBuildHistory();
    }

    getBuildStats() {
        const stats = this.utils.getStorage('export_stats', { html: 0, pwa: 0, apk: 0 });
        return {
            total: stats.html + stats.pwa + stats.apk,
            byType: stats,
            queue: this.buildQueue.length
        };
    }

    cancelBuild(buildId) {
        const index = this.buildQueue.findIndex(b => b.id === buildId);
        if (index !== -1) {
            this.buildQueue[index].status = 'cancelled';
            this.saveBuildHistory();
            return true;
        }
        return false;
    }

    clearBuildHistory() {
        this.buildQueue = [];
        this.saveBuildHistory();
        this.uiManager.showToast('Build history cleared', 'info');
    }
}

// Create global instance
window.apkBuilder = new APKBuilder();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APKBuilder;
}
