// Preview Manager - Handles device preview and responsive testing

const PreviewManager = {
    // Current device
    currentDevice: 'mobile',

    // Device sizes
    devices: {
        mobile: { width: 375, height: 667, name: 'iPhone SE' },
        tablet: { width: 768, height: 1024, name: 'iPad Mini' },
        desktop: { width: '100%', height: 600, name: 'Desktop' }
    },

    // Initialize
    init() {
        this.setupDeviceSelector();
        this.setupRefresh();
    },

    // Setup device selector
    setupDeviceSelector() {
        const deviceSelect = document.getElementById('deviceSelect');
        if (!deviceSelect) return;

        deviceSelect.addEventListener('change', (e) => {
            this.setDevice(e.target.value);
        });
    },

    // Setup refresh button (if exists)
    setupRefresh() {
        // Auto-refresh is handled by CodeEditor
    },

    // Set device
    setDevice(device) {
        this.currentDevice = device;
        const preview = document.getElementById('appPreview');
        const deviceFrame = document.getElementById('deviceFrame');
        
        if (!preview) return;

        const size = this.devices[device];
        
        // Remove all device classes
        preview.classList.remove('mobile', 'tablet', 'desktop');
        
        // Add new device class
        preview.classList.add(device);

        // Update iframe size
        if (device === 'desktop') {
            preview.style.width = '100%';
            preview.style.height = '600px';
            if (deviceFrame) {
                deviceFrame.style.padding = '20px';
            }
        } else {
            preview.style.width = `${size.width}px`;
            preview.style.height = `${size.height}px`;
            if (deviceFrame) {
                deviceFrame.style.padding = '40px 20px 20px';
            }
        }

        // Refresh preview
        this.refresh();
    },

    // Refresh preview
    refresh() {
        const preview = document.getElementById('appPreview');
        const code = CodeEditor.getCode();
        
        if (preview && code) {
            const doc = preview.contentDocument || preview.contentWindow.document;
            doc.open();
            doc.write(code);
            doc.close();
        }
    },

    // Get current device
    getCurrentDevice() {
        return this.currentDevice;
    },

    // Get device dimensions
    getDeviceDimensions(device = null) {
        const dev = device || this.currentDevice;
        return this.devices[dev];
    },

    // Take screenshot (simulated)
    async takeScreenshot() {
        UIManager.toast('Screenshot feature coming soon!', 'info');
    },

    // Open in new window
    openInNewWindow() {
        const code = CodeEditor.getCode();
        if (!code.trim()) {
            UIManager.toast('No code to preview!', 'error');
            return;
        }

        const newWindow = window.open('', '_blank', `width=${this.devices.mobile.width},height=${this.devices.mobile.height}`);
        if (newWindow) {
            newWindow.document.write(code);
            newWindow.document.close();
        } else {
            UIManager.toast('Popup blocked! Please allow popups.', 'error');
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    PreviewManager.init();
});

window.PreviewManager = PreviewManager;
