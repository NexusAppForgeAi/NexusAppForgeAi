// UI Manager - Handles UI components, modals, tabs, and toast notifications

const UIManager = {
    // Initialize UI
    init() {
        this.setupTabs();
        this.setupModals();
        this.setupThemeToggle();
        this.setupLineNumbers();
    },

    // Tab Navigation
    setupTabs() {
        const navTabs = document.querySelectorAll('.nav-tab');
        const tabContents = document.querySelectorAll('.tab-content');

        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;

                // Update nav tabs
                navTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update tab contents
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${targetTab}Tab`) {
                        content.classList.add('active');
                    }
                });
            });
        });
    },

    // Panel Tabs (Code/Visual)
    setupPanelTabs() {
        const panelTabs = document.querySelectorAll('.panel-tab');

        panelTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPanel = tab.dataset.panel;

                panelTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Toggle between code editor and visual view
                const codeEditor = document.querySelector('.code-editor-container');
                if (targetPanel === 'visual') {
                    codeEditor.style.display = 'none';
                    // Could show a visual/WYSIWYG editor here
                } else {
                    codeEditor.style.display = 'flex';
                }
            });
        });
    },

    // Modal Management
    setupModals() {
        // Close modal on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Close button
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Settings tabs
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const targetSetting = tab.dataset.setting;

                document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                document.querySelectorAll('.setting-panel').forEach(panel => {
                    panel.classList.remove('active');
                });

                const targetPanel = document.getElementById(`${targetSetting}Settings`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    },

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    // Theme Toggle
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            // Load saved theme
            const savedTheme = Utils.storage.get('appforge_theme', 'dark');
            document.documentElement.setAttribute('data-theme', savedTheme);
            this.updateThemeIcon(savedTheme);

            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

                document.documentElement.setAttribute('data-theme', newTheme);
                Utils.storage.set('appforge_theme', newTheme);
                this.updateThemeIcon(newTheme);
            });
        }
    },

    updateThemeIcon(theme) {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
    },

    // Line Numbers for Code Editor
    setupLineNumbers() {
        const codeEditor = document.getElementById('codeEditor');
        const lineNumbers = document.getElementById('lineNumbers');

        if (codeEditor && lineNumbers) {
            const updateLineNumbers = () => {
                const lines = codeEditor.value.split('\n').length;
                lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
            };

            codeEditor.addEventListener('input', updateLineNumbers);
            codeEditor.addEventListener('scroll', () => {
                lineNumbers.scrollTop = codeEditor.scrollTop;
            });

            // Initial update
            updateLineNumbers();
        }
    },

    // Toast Notifications
    toast(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${icons[type]} toast-icon"></i>
            <div class="toast-content">
                <div class="toast-title">${titles[type]}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.removeToast(toast);
        });

        container.appendChild(toast);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }

        return toast;
    },

    removeToast(toast) {
        toast.style.animation = 'toastSlideIn 0.3s ease reverse';
        setTimeout(() => {
            toast.remove();
        }, 300);
    },

    // Loading State
    setLoading(elementId, loading = true) {
        const element = document.getElementById(elementId);
        if (!element) return;

        if (loading) {
            element.disabled = true;
            element.dataset.originalText = element.innerHTML;
            element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        } else {
            element.disabled = false;
            if (element.dataset.originalText) {
                element.innerHTML = element.dataset.originalText;
            }
        }
    },

    // Update Connection Status
    updateConnectionStatus(status, message) {
        const statusEl = document.getElementById('connectionStatus');
        if (!statusEl) return;

        const icons = {
            connected: '<i class="fas fa-check-circle"></i>',
            disconnected: '<i class="fas fa-exclamation-circle"></i>',
            checking: '<i class="fas fa-circle-notch fa-spin"></i>'
        };

        statusEl.innerHTML = `${icons[status] || icons.checking} ${message}`;
        statusEl.className = status;
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
});

window.UIManager = UIManager;
