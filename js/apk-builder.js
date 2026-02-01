// APK Builder - Handles APK/PWA export and build process

const APKBuilder = {
    // Build state
    buildState: {
        isBuilding: false,
        progress: 0,
        currentStep: ''
    },

    // Build steps
    buildSteps: [
        { name: 'Validating configuration', progress: 10 },
        { name: 'Preparing source files', progress: 20 },
        { name: 'Setting up Android project', progress: 30 },
        { name: 'Configuring WebView', progress: 40 },
        { name: 'Building resources', progress: 50 },
        { name: 'Compiling code', progress: 70 },
        { name: 'Packaging APK', progress: 85 },
        { name: 'Signing APK', progress: 95 },
        { name: 'Build complete!', progress: 100 }
    ],

    // Initialize
    init() {
        this.setupEventListeners();
    },

    // Setup event listeners
    setupEventListeners() {
        // Export buttons
        const exportHtmlBtn = document.getElementById('exportHtmlBtn');
        if (exportHtmlBtn) {
            exportHtmlBtn.addEventListener('click', () => this.exportHTML());
        }

        const exportPwaBtn = document.getElementById('exportPwaBtn');
        if (exportPwaBtn) {
            exportPwaBtn.addEventListener('click', () => this.exportPWA());
        }

        const buildApkBtn = document.getElementById('buildApkBtn');
        if (buildApkBtn) {
            buildApkBtn.addEventListener('click', () => this.openApkBuilder());
        }

        // APK builder modal
        const closeApkModal = document.getElementById('closeApkModal');
        if (closeApkModal) {
            closeApkModal.addEventListener('click', () => {
                UIManager.closeModal('apkBuilderModal');
            });
        }

        const startBuildBtn = document.getElementById('startBuildBtn');
        if (startBuildBtn) {
            startBuildBtn.addEventListener('click', () => this.startBuild());
        }

        const cancelBuildBtn = document.getElementById('cancelBuildBtn');
        if (cancelBuildBtn) {
            cancelBuildBtn.addEventListener('click', () => {
                UIManager.closeModal('apkBuilderModal');
            });
        }

        // Icon upload
        const iconUpload = document.getElementById('iconUpload');
        if (iconUpload) {
            this.setupIconUpload(iconUpload);
        }
    },

    // Export as HTML
    exportHTML() {
        const code = CodeEditor.getCode();
        if (!code.trim()) {
            UIManager.toast('No code to export!', 'error');
            return;
        }

        // Add attribution if needed
        const finalCode = LicenseManager.addAttribution(code);

        // Download
        Utils.downloadFile(finalCode, 'appforge-app.html', 'text/html');

        // Track
        UserManager.addExportHistory('html', 'appforge-app.html', finalCode.length);

        UIManager.toast('HTML file downloaded!', 'success');
    },

    // Export as PWA
    exportPWA() {
        // Check if user can export PWA
        if (!LicenseManager.canExport('pwa')) {
            UIManager.toast('PWA export limit reached. Upgrade to Pro!', 'warning');
            return;
        }

        const code = CodeEditor.getCode();
        if (!code.trim()) {
            UIManager.toast('No code to export!', 'error');
            return;
        }

        // Generate manifest
        const manifest = this.generateManifest();

        // Generate service worker
        const serviceWorker = this.generateServiceWorker();

        // Create ZIP content
        const files = {
            'index.html': LicenseManager.addAttribution(code),
            'manifest.json': JSON.stringify(manifest, null, 2),
            'sw.js': serviceWorker,
            'README.txt': this.generateReadme()
        };

        // Create and download ZIP
        this.downloadZip(files, 'appforge-pwa.zip');

        // Track
        UserManager.trackUsage('pwaExports');
        UserManager.addExportHistory('pwa', 'appforge-pwa.zip', 0);

        UIManager.toast('PWA package downloaded!', 'success');
    },

    // Generate PWA manifest
    generateManifest() {
        const appName = document.getElementById('appName')?.value || 'My AppForge App';
        
        return {
            name: appName,
            short_name: appName.substring(0, 12),
            description: 'Built with AppForge',
            start_url: '/',
            display: 'standalone',
            background_color: '#ffffff',
            theme_color: '#3366FF',
            icons: [
                {
                    src: 'icon-192.png',
                    sizes: '192x192',
                    type: 'image/png'
                },
                {
                    src: 'icon-512.png',
                    sizes: '512x512',
                    type: 'image/png'
                }
            ]
        };
    },

    // Generate service worker
    generateServiceWorker() {
        return `// Service Worker for AppForge PWA
const CACHE_NAME = 'appforge-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
});
`;
    },

    // Generate README
    generateReadme() {
        return `AppForge PWA
============

This Progressive Web App was built with AppForge.

Getting Started:
1. Extract all files to a folder
2. Serve the folder using any web server
3. Open in a modern browser
4. Click "Add to Home Screen" when prompted

For hosting:
- Upload to GitHub Pages (free)
- Use Netlify (free tier)
- Use Vercel (free tier)

Built with love by AppForge
https://appforge.dev
`;
    },

    // Open APK builder modal
    openApkBuilder() {
        // Check if user can build APK
        if (!LicenseManager.canExport('apk')) {
            UIManager.toast('APK builds require Pro plan. Upgrade now!', 'warning');
            UIManager.openModal('settingsModal');
            
            // Switch to license tab
            document.querySelector('.settings-tab[data-setting="license"]')?.click();
            return;
        }

        // Pre-fill app name
        const appName = document.getElementById('appName');
        if (appName && !appName.value) {
            appName.value = 'My AppForge App';
        }

        // Generate package name
        const packageName = document.getElementById('packageName');
        if (packageName && !packageName.value) {
            const random = Math.random().toString(36).substring(7);
            packageName.value = `com.appforge.app${random}`;
        }

        UIManager.openModal('apkBuilderModal');
    },

    // Setup icon upload
    setupIconUpload(uploadZone) {
        uploadZone.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleIconUpload(file, uploadZone);
                }
            };
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
                this.handleIconUpload(file, uploadZone);
            }
        });
    },

    // Handle icon upload
    async handleIconUpload(file, uploadZone) {
        try {
            const dataUrl = await Utils.readFileAsDataURL(file);
            uploadZone.innerHTML = `<img src="${dataUrl}" alt="App Icon">`;
            uploadZone.dataset.icon = dataUrl;
        } catch (error) {
            UIManager.toast('Failed to load icon', 'error');
        }
    },

    // Start APK build
    async startBuild() {
        if (this.buildState.isBuilding) return;

        const appName = document.getElementById('appName')?.value;
        const packageName = document.getElementById('packageName')?.value;

        if (!appName || !packageName) {
            UIManager.toast('Please fill in all required fields', 'error');
            return;
        }

        this.buildState.isBuilding = true;
        this.buildState.progress = 0;

        // Show progress
        const progressEl = document.getElementById('buildProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        if (progressEl) progressEl.style.display = 'block';

        // Simulate build process
        for (const step of this.buildSteps) {
            if (progressText) progressText.textContent = step.name;
            if (progressFill) progressFill.style.width = `${step.progress}%`;
            
            await this.delay(800);
        }

        // Build complete
        this.buildState.isBuilding = false;
        this.buildState.progress = 100;

        // Track usage
        UserManager.trackUsage('apkBuilds');

        // Create APK file (simulated)
        await this.createApkFile(appName, packageName);

        // Close modal
        UIManager.closeModal('apkBuilderModal');

        // Reset progress
        if (progressEl) progressEl.style.display = 'none';
        if (progressFill) progressFill.style.width = '0%';

        UIManager.toast('APK build complete! Download started.', 'success');
    },

    // Create APK file (simulated)
    async createApkFile(appName, packageName) {
        const code = CodeEditor.getCode();
        
        // Create a simple HTML wrapper that simulates an APK structure
        const apkContent = this.generateApkContent(code, appName, packageName);
        
        // Download as a placeholder APK
        const blob = new Blob([apkContent], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${appName.replace(/\s+/g, '_').toLowerCase()}.apk`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Add to history
        UserManager.addExportHistory('apk', `${appName}.apk`, apkContent.length);
    },

    // Generate APK content (simulated)
    generateApkContent(htmlCode, appName, packageName) {
        // In a real app, this would generate an actual APK
        // For now, we create a ZIP-like structure with instructions
        
        return `APK_BUILD_DATA
==============
App Name: ${appName}
Package: ${packageName}
Generated: ${new Date().toISOString()}

NOTE: This is a simulated APK build.
For real APK generation, the app would need to:
1. Compile with Android SDK
2. Use Cordova/Capacitor wrapper
3. Sign with keystore
4. Output signed APK

HTML Content Size: ${htmlCode.length} bytes
`;
    },

    // Download ZIP
    async downloadZip(files, filename) {
        // Simple ZIP creation (in production, use a library like JSZip)
        let zipContent = '';
        
        for (const [name, content] of Object.entries(files)) {
            zipContent += `=== ${name} ===\n${content}\n\n`;
        }

        Utils.downloadFile(zipContent, filename, 'application/zip');
    },

    // Delay helper
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    APKBuilder.init();
});

window.APKBuilder = APKBuilder;
