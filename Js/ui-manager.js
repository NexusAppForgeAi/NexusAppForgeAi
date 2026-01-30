// UI Manager for AppForge

class UIManager {
    constructor() {
        this.utils = window.utils;
        this.currentModal = null;
        this.toastQueue = [];
        this.isProcessing = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTheme();
        this.setupNavigation();
        this.setupModals();
        this.setupToasts();
        this.setupTooltips();
    }

    // Theme Management
    setupTheme() {
        const savedTheme = this.utils.getTheme();
        this.utils.setTheme(savedTheme);
        
        // Set theme toggle button text
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.textContent = savedTheme === 'light' ? '🌙' : '☀️';
        }
    }

    toggleTheme() {
        const newTheme = this.utils.toggleTheme();
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.textContent = newTheme === 'light' ? '🌙' : '☀️';
        }
        this.showToast(`Switched to ${newTheme} theme`, 'info');
    }

    // Navigation
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                
                // Update active button
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show corresponding tab
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${tabName}Tab`) {
                        content.classList.add('active');
                    }
                });

                // Track navigation
                this.utils.trackEvent('tab_switch', { tab: tabName });
            });
        });
    }

    // Modal System
    setupModals() {
        // Close modal on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });

        // Close modal on outside click
        document.addEventListener('click', (e) => {
            if (this.currentModal && e.target.classList.contains('modal-container')) {
                this.closeModal();
            }
        });
    }

    showModal(title, content, options = {}) {
        // Close any existing modal
        this.closeModal();

        const modalId = `modal-${this.utils.randomId(6)}`;
        const modalHTML = `
            <div class="modal-overlay" id="${modalId}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" onclick="uiManager.closeModal()">×</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${options.footer ? `
                    <div class="modal-footer">
                        ${options.footer}
                    </div>` : ''}
                </div>
            </div>
        `;

        // Create modal container if it doesn't exist
        let modalContainer = document.getElementById('modalContainer');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'modalContainer';
            modalContainer.className = 'modal-container';
            document.body.appendChild(modalContainer);
        }

        modalContainer.innerHTML = modalHTML;
        modalContainer.style.display = 'block';
        this.currentModal = modalId;

        // Add CSS for modal if not already present
        this.addModalStyles();

        // Focus trap
        this.setupFocusTrap(modalId);

        // Animate in
        setTimeout(() => {
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.add('active');
        }, 10);

        this.utils.trackEvent('modal_opened', { title, modalId });

        return modalId;
    }

    addModalStyles() {
        if (document.getElementById('modal-styles')) return;

        const styles = `
            .modal-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: none;
                z-index: 1000;
                justify-content: center;
                align-items: center;
            }

            .modal-overlay {
                opacity: 0;
                transform: scale(0.9) translateY(-20px);
                transition: all 0.3s ease;
            }

            .modal-overlay.active {
                opacity: 1;
                transform: scale(1) translateY(0);
            }

            .modal-content {
                background: var(--surface-color);
                border-radius: var(--radius);
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }

            .modal-header {
                padding: 1.5rem;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .modal-header h3 {
                margin: 0;
                color: var(--text-color);
            }

            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                transition: var(--transition);
                line-height: 1;
            }

            .modal-close:hover {
                background: var(--border-color);
                color: var(--text-color);
            }

            .modal-body {
                padding: 2rem;
                max-height: calc(90vh - 120px);
                overflow-y: auto;
            }

            .modal-footer {
                padding: 1.5rem;
                border-top: 1px solid var(--border-color);
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
                background: var(--background-color);
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'modal-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    setupFocusTrap(modalId) {
        const modal = document.getElementById(modalId);
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            modal.addEventListener('keydown', (e) => {
                if (e.key !== 'Tab') return;
                
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            });
            
            firstElement.focus();
        }
    }

    closeModal() {
        if (!this.currentModal) return;

        const modal = document.getElementById(this.currentModal);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                const modalContainer = document.getElementById('modalContainer');
                if (modalContainer) {
                    modalContainer.style.display = 'none';
                    modalContainer.innerHTML = '';
                }
                this.currentModal = null;
            }, 300);
        }

        this.utils.trackEvent('modal_closed');
    }

    // Toast System
    setupToasts() {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toastContainer')) {
            const container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Add toast styles
        this.addToastStyles();

        // Process queue
        setInterval(() => this.processToastQueue(), 100);
    }

    addToastStyles() {
        if (document.getElementById('toast-styles')) return;

        const styles = `
            .toast-container {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 1rem;
            }

            .toast {
                background: var(--surface-color);
                color: var(--text-color);
                padding: 1rem 1.5rem;
                border-radius: var(--radius);
                box-shadow: var(--shadow);
                display: flex;
                align-items: center;
                gap: 1rem;
                animation: toastSlideIn 0.3s ease;
                border-left: 4px solid var(--primary-color);
                max-width: 400px;
                transform: translateX(100%);
                opacity: 0;
            }

            .toast.show {
                transform: translateX(0);
                opacity: 1;
            }

            .toast.hide {
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease;
            }

            .toast.success {
                border-left-color: #10B981;
            }

            .toast.error {
                border-left-color: #EF4444;
            }

            .toast.warning {
                border-left-color: #F59E0B;
            }

            .toast.info {
                border-left-color: #3B82F6;
            }

            .toast-icon {
                font-size: 1.5rem;
            }

            .toast-content {
                flex: 1;
            }

            .toast-title {
                font-weight: 600;
                margin-bottom: 0.25rem;
            }

            .toast-message {
                font-size: 0.9rem;
                color: var(--text-secondary);
            }

            .toast-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                transition: var(--transition);
                font-size: 1.2rem;
                line-height: 1;
            }

            .toast-close:hover {
                background: var(--border-color);
                color: var(--text-color);
            }

            @keyframes toastSlideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'toast-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    showToast(message, type = 'info', title = '', duration = 5000) {
        const toastId = `toast-${this.utils.randomId(6)}`;
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const toast = {
            id: toastId,
            type,
            title: title || this.utils.capitalize(type),
            message,
            duration,
            timestamp: Date.now()
        };

        this.toastQueue.push(toast);
        this.utils.trackEvent('toast_shown', { type, title, message });

        return toastId;
    }

    processToastQueue() {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const now = Date.now();
        const activeToasts = container.querySelectorAll('.toast');

        // Remove old toasts
        activeToasts.forEach(toast => {
            if (toast.classList.contains('hide')) {
                setTimeout(() => toast.remove(), 300);
            }
        });

        // Show new toasts
        this.toastQueue.forEach((toast, index) => {
            if (now - toast.timestamp < 100) return; // Wait 100ms before showing

            const toastElement = document.createElement('div');
            toastElement.id = toast.id;
            toastElement.className = `toast ${toast.type}`;
            toastElement.innerHTML = `
                <div class="toast-icon">${toast.type === 'success' ? '✅' : 
                                         toast.type === 'error' ? '❌' : 
                                         toast.type === 'warning' ? '⚠️' : 'ℹ️'}</div>
                <div class="toast-content">
                    <div class="toast-title">${toast.title}</div>
                    <div class="toast-message">${toast.message}</div>
                </div>
                <button class="toast-close" onclick="uiManager.removeToast('${toast.id}')">×</button>
            `;

            container.appendChild(toastElement);

            // Trigger animation
            setTimeout(() => {
                toastElement.classList.add('show');
            }, 10);

            // Auto-remove after duration
            if (toast.duration > 0) {
                setTimeout(() => {
                    this.removeToast(toast.id);
                }, toast.duration);
            }

            // Remove from queue
            this.toastQueue.splice(index, 1);
        });
    }

    removeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.classList.remove('show');
            toast.classList.add('hide');
        }
    }

    // Tooltip System
    setupTooltips() {
        // Add tooltip styles
        this.addTooltipStyles();

        // Handle tooltip triggers
        document.addEventListener('mouseover', (e) => {
            const target = e.target;
            const title = target.getAttribute('title');
            
            if (title && !target.hasAttribute('data-tooltip-initialized')) {
                target.removeAttribute('title');
                target.setAttribute('data-tooltip', title);
                target.setAttribute('data-tooltip-initialized', 'true');
                
                target.addEventListener('mouseenter', this.showTooltip.bind(this));
                target.addEventListener('mouseleave', this.hideTooltip.bind(this));
            }
        });
    }

    addTooltipStyles() {
        if (document.getElementById('tooltip-styles')) return;

        const styles = `
            .tooltip {
                position: absolute;
                background: var(--surface-color);
                color: var(--text-color);
                padding: 0.5rem 1rem;
                border-radius: var(--radius);
                font-size: 0.875rem;
                box-shadow: var(--shadow);
                z-index: 1000;
                max-width: 300px;
                pointer-events: none;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.2s ease;
            }

            .tooltip.show {
                opacity: 1;
                transform: translateY(0);
            }

            .tooltip-arrow {
                position: absolute;
                width: 8px;
                height: 8px;
                background: var(--surface-color);
                transform: rotate(45deg);
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'tooltip-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    showTooltip(e) {
        const target = e.target;
        const tooltipText = target.getAttribute('data-tooltip');
        if (!tooltipText) return;

        // Remove existing tooltip
        this.hideTooltip();

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        tooltip.id = 'current-tooltip';

        document.body.appendChild(tooltip);

        // Position tooltip
        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top = rect.top - tooltipRect.height - 10;
        let left = rect.left + (rect.width - tooltipRect.width) / 2;

        // Adjust if tooltip goes off screen
        if (top < 0) {
            top = rect.bottom + 10;
        }
        if (left < 0) {
            left = 10;
        }
        if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 10;
        }

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;

        // Show tooltip
        setTimeout(() => {
            tooltip.classList.add('show');
        }, 10);
    }

    hideTooltip() {
        const tooltip = document.getElementById('current-tooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
            setTimeout(() => tooltip.remove(), 200);
        }
    }

    // Loading States
    showLoading(message = 'Loading...') {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.querySelector('p').textContent = message;
            loadingScreen.style.display = 'flex';
        }
        this.isProcessing = true;
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        const appContainer = document.getElementById('appContainer');
        if (appContainer) {
            appContainer.style.display = 'block';
        }
        
        this.isProcessing = false;
    }

    showProgress(percentage, message = '') {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            const progressBar = loadingScreen.querySelector('.loading-progress');
            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
            }
            if (message) {
                loadingScreen.querySelector('p').textContent = message;
            }
        }
    }

    // Form Handling
    validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return { valid: false, errors: ['Form not found'] };

        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        const errors = [];

        inputs.forEach(input => {
            if (!input.value.trim()) {
                errors.push(`${input.name || input.placeholder || 'Field'} is required`);
                this.highlightError(input);
            } else {
                this.removeErrorHighlight(input);
            }

            // Email validation
            if (input.type === 'email' && input.value.trim()) {
                if (!this.utils.isValidEmail(input.value)) {
                    errors.push('Please enter a valid email address');
                    this.highlightError(input);
                }
            }

            // URL validation
            if (input.type === 'url' && input.value.trim()) {
                if (!this.utils.isValidUrl(input.value)) {
                    errors.push('Please enter a valid URL');
                    this.highlightError(input);
                }
            }
        });

        return {
            valid: errors.length === 0,
            errors
        };
    }

    highlightError(element) {
        element.classList.add('error');
        element.style.borderColor = '#EF4444';
        element.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
    }

    removeErrorHighlight(element) {
        element.classList.remove('error');
        element.style.borderColor = '';
        element.style.boxShadow = '';
    }

    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => this.removeErrorHighlight(input));
        }
    }

    // Confirmation Dialog
    confirm(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const modalContent = `
                <p>${message}</p>
            `;

            const modalFooter = `
                <button class="btn btn-outline" onclick="uiManager.closeModal(); resolve(false)">Cancel</button>
                <button class="btn btn-primary" onclick="uiManager.closeModal(); resolve(true)">Confirm</button>
            `;

            this.showModal(title, modalContent, { footer: modalFooter });
        });
    }

    // Alert Dialog
    alert(message, title = 'Notice') {
        return new Promise((resolve) => {
            const modalContent = `
                <p>${message}</p>
            `;

            const modalFooter = `
                <button class="btn btn-primary" onclick="uiManager.closeModal(); resolve()">OK</button>
            `;

            this.showModal(title, modalContent, { footer: modalFooter });
        });
    }

    // Prompt Dialog
    prompt(message, defaultValue = '', title = 'Input Required') {
        return new Promise((resolve) => {
            const inputId = `prompt-input-${this.utils.randomId(6)}`;
            const modalContent = `
                <p>${message}</p>
                <input type="text" id="${inputId}" class="form-control" value="${defaultValue}" placeholder="Enter value...">
            `;

            const modalFooter = `
                <button class="btn btn-outline" onclick="uiManager.closeModal(); resolve(null)">Cancel</button>
                <button class="btn btn-primary" onclick="uiManager.closeModal(); resolve(document.getElementById('${inputId}').value)">Submit</button>
            `;

            this.showModal(title, modalContent, { footer: modalFooter });

            // Focus input
            setTimeout(() => {
                const input = document.getElementById(inputId);
                if (input) input.focus();
            }, 100);
        });
    }

    // File Picker
    pickFile(accept = '*/*', multiple = false) {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.multiple = multiple;
            input.style.display = 'none';

            input.onchange = (e) => {
                const files = Array.from(e.target.files);
                resolve(multiple ? files : files[0]);
                document.body.removeChild(input);
            };

            input.oncancel = () => {
                resolve(null);
                document.body.removeChild(input);
            };

            document.body.appendChild(input);
            input.click();
        });
    }

    // Update UI State
    updateUIState(state) {
        const elements = document.querySelectorAll('[data-ui-state]');
        elements.forEach(element => {
            const states = element.getAttribute('data-ui-state').split(' ');
            const shouldShow = states.includes(state);
            element.style.display = shouldShow ? '' : 'none';
        });
    }

    // Dynamic Content Loading
    loadContent(url, containerId, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                this.showLoading(options.loadingMessage || 'Loading content...');
                
                const response = await this.utils.fetchWithTimeout(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const html = await response.text();
                const container = document.getElementById(containerId);
                
                if (container) {
                    if (options.replace) {
                        container.innerHTML = html;
                    } else {
                        container.insertAdjacentHTML('beforeend', html);
                    }
                }
                
                this.hideLoading();
                resolve(html);
            } catch (error) {
                this.hideLoading();
                this.showToast('Failed to load content', 'error');
                reject(error);
            }
        });
    }

    // Responsive Helpers
    isMobile() {
        return window.innerWidth <= 768;
    }

    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    }

    isDesktop() {
        return window.innerWidth > 1024;
    }

    // Accessibility
    setFocus(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    announceToScreenReader(message) {
        const ariaLive = document.getElementById('aria-live-region');
        if (!ariaLive) {
            const region = document.createElement('div');
            region.id = 'aria-live-region';
            region.setAttribute('aria-live', 'polite');
            region.setAttribute('aria-atomic', 'true');
            region.style.position = 'absolute';
            region.style.width = '1px';
            region.style.height = '1px';
            region.style.padding = '0';
            region.style.margin = '-1px';
            region.style.overflow = 'hidden';
            region.style.clip = 'rect(0, 0, 0, 0)';
            region.style.whiteSpace = 'nowrap';
            region.style.border = '0';
            document.body.appendChild(region);
        }

        const region = document.getElementById('aria-live-region');
        region.textContent = message;
    }
}

// Create global instance
window.uiManager = new UIManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
