// User Manager - Handles user accounts, usage tracking, and export history

const UserManager = {
    // Default user state
    state: {
        isLoggedIn: false,
        userId: null,
        name: 'Guest User',
        email: null,
        tier: 'free',
        usage: {
            aiGenerations: 0,
            pwaExports: 0,
            apkBuilds: 0,
            lastReset: Date.now()
        },
        exportHistory: []
    },

    // Tier limits
    limits: {
        free: {
            aiGenerations: Infinity,
            pwaExports: 3,
            apkBuilds: 0
        },
        pro: {
            aiGenerations: Infinity,
            pwaExports: Infinity,
            apkBuilds: 10
        },
        team: {
            aiGenerations: Infinity,
            pwaExports: Infinity,
            apkBuilds: Infinity
        }
    },

    // Initialize
    init() {
        this.loadUserData();
        this.updateUsageUI();
        this.setupEventListeners();
    },

    // Load user data from storage
    loadUserData() {
        const saved = Utils.storage.get('appforge_user');
        if (saved) {
            this.state = { ...this.state, ...saved };
        }
        this.checkMonthlyReset();
    },

    // Save user data
    saveUserData() {
        Utils.storage.set('appforge_user', this.state);
    },

    // Check if monthly usage should reset
    checkMonthlyReset() {
        const now = Date.now();
        const lastReset = this.state.usage.lastReset;
        const oneMonth = 30 * 24 * 60 * 60 * 1000;

        if (now - lastReset > oneMonth) {
            this.state.usage = {
                aiGenerations: 0,
                pwaExports: 0,
                apkBuilds: 0,
                lastReset: now
            };
            this.saveUserData();
        }
    },

    // Setup event listeners
    setupEventListeners() {
        // Sign in button
        const signInBtn = document.getElementById('signInBtn');
        if (signInBtn) {
            signInBtn.addEventListener('click', () => {
                this.showSignInModal();
            });
        }

        // Create account button
        const createAccountBtn = document.getElementById('createAccountBtn');
        if (createAccountBtn) {
            createAccountBtn.addEventListener('click', () => {
                this.showCreateAccountModal();
            });
        }

        // Upgrade buttons
        document.querySelectorAll('.btn-upgrade').forEach(btn => {
            btn.addEventListener('click', () => {
                const plan = btn.dataset.plan;
                this.upgradePlan(plan);
            });
        });
    },

    // Get current tier limits
    getCurrentLimits() {
        return this.limits[this.state.tier] || this.limits.free;
    },

    // Check if user can perform action
    canPerform(action) {
        const limits = this.getCurrentLimits();
        const current = this.state.usage[action];

        if (limits[action] === Infinity) return true;
        return current < limits[action];
    },

    // Track usage
    trackUsage(action) {
        if (this.state.usage[action] !== undefined) {
            this.state.usage[action]++;
            this.saveUserData();
            this.updateUsageUI();
            return true;
        }
        return false;
    },

    // Add export to history
    addExportHistory(type, filename, size) {
        const exportItem = {
            id: Utils.generateId(),
            type,
            filename,
            size,
            timestamp: Date.now()
        };

        this.state.exportHistory.unshift(exportItem);

        // Keep only last 50 exports
        if (this.state.exportHistory.length > 50) {
            this.state.exportHistory = this.state.exportHistory.slice(0, 50);
        }

        this.saveUserData();
        this.updateExportHistoryUI();
    },

    // Update usage UI
    updateUsageUI() {
        const limits = this.getCurrentLimits();
        const usage = this.state.usage;

        // Update account info
        const accountName = document.getElementById('accountName');
        const accountEmail = document.getElementById('accountEmail');
        const accountTier = document.getElementById('accountTier');

        if (accountName) accountName.textContent = this.state.name;
        if (accountEmail) accountEmail.textContent = this.state.email || 'Not signed in';
        if (accountTier) {
            accountTier.textContent = `${this.capitalize(this.state.tier)} Tier`;
            accountTier.className = `account-tier tier-${this.state.tier}`;
        }

        // Update progress bars
        this.updateProgressBar('aiGen', usage.aiGenerations, limits.aiGenerations);
        this.updateProgressBar('pwa', usage.pwaExports, limits.pwaExports);
        this.updateProgressBar('apk', usage.apkBuilds, limits.apkBuilds);

        // Update license note in footer
        const licenseNote = document.getElementById('licenseNote');
        if (licenseNote) {
            if (this.state.tier === 'free') {
                licenseNote.textContent = 'Free Tier - "Built with AppForge" attribution required';
            } else if (this.state.tier === 'pro') {
                licenseNote.textContent = 'Pro Tier - All features unlocked';
            } else {
                licenseNote.textContent = 'Team Tier - Unlimited everything';
            }
        }

        // Update license card
        this.updateLicenseCard();
    },

    // Update progress bar
    updateProgressBar(type, current, limit) {
        const bar = document.getElementById(`${type}Bar`);
        const count = document.getElementById(`${type}Count`);

        if (bar && count) {
            const percentage = limit === Infinity ? 0 : (current / limit) * 100;
            bar.style.width = `${Math.min(percentage, 100)}%`;

            if (limit === Infinity) {
                count.textContent = `${current} / Unlimited`;
            } else {
                count.textContent = `${current} / ${limit}`;
            }
        }
    },

    // Update license card
    updateLicenseCard() {
        const licenseCard = document.getElementById('currentLicense');
        if (!licenseCard) return;

        const tierName = licenseCard.querySelector('.license-tier');
        if (tierName) {
            tierName.textContent = this.capitalize(this.state.tier);
        }
    },

    // Update export history UI
    updateExportHistoryUI() {
        const historyList = document.getElementById('exportHistoryList');
        if (!historyList) return;

        if (this.state.exportHistory.length === 0) {
            historyList.innerHTML = '<p class="empty-state">No exports yet. Create and export your first app!</p>';
            return;
        }

        historyList.innerHTML = this.state.exportHistory.map(item => `
            <div class="history-item" data-id="${item.id}">
                <div class="history-icon">
                    <i class="fas ${this.getExportIcon(item.type)}"></i>
                </div>
                <div class="history-info">
                    <div class="history-filename">${item.filename}</div>
                    <div class="history-meta">
                        <span class="history-type">${item.type.toUpperCase()}</span>
                        <span class="history-size">${Utils.formatFileSize(item.size)}</span>
                        <span class="history-date">${Utils.formatDate(item.timestamp)}</span>
                    </div>
                </div>
                <button class="history-download" title="Download again">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        `).join('');
    },

    // Get export icon
    getExportIcon(type) {
        const icons = {
            html: 'fa-html5',
            pwa: 'fa-mobile-alt',
            apk: 'fa-android',
            ios: 'fa-apple'
        };
        return icons[type] || 'fa-file';
    },

    // Upgrade plan
    upgradePlan(plan) {
        // In a real app, this would open a payment modal
        UIManager.toast(`Upgrade to ${this.capitalize(plan)} coming soon!`, 'info');
    },

    // Show sign in modal
    showSignInModal() {
        UIManager.toast('Sign in feature coming soon!', 'info');
    },

    // Show create account modal
    showCreateAccountModal() {
        UIManager.toast('Account creation coming soon!', 'info');
    },

    // Capitalize string
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // Get current user state
    getState() {
        return { ...this.state };
    },

    // Set user tier (for testing)
    setTier(tier) {
        if (this.limits[tier]) {
            this.state.tier = tier;
            this.saveUserData();
            this.updateUsageUI();
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    UserManager.init();
});

window.UserManager = UserManager;
