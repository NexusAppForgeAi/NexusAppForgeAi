// License Manager - Handles licensing, copyright, and monetization

const LicenseManager = {
    // License types
    licenses: {
        free: {
            name: 'Free',
            price: 0,
            features: [
                'Unlimited AI generations',
                'Basic templates',
                '3 PWA exports/month',
                'HTML download',
                'Community support'
            ],
            limitations: [
                'APK export not included',
                'iOS export not included',
                '"Built with AppForge" branding required',
                'No priority support'
            ],
            attribution: true
        },
        pro: {
            name: 'Pro',
            price: 19,
            period: 'month',
            features: [
                'Everything in Free',
                '10 APK builds/month',
                'Unlimited PWA exports',
                'Remove branding',
                'Priority support',
                'Code copyright protection',
                'All premium templates'
            ],
            attribution: false
        },
        team: {
            name: 'Team',
            price: 99,
            period: 'month',
            features: [
                'Everything in Pro',
                'Unlimited team members',
                'Unlimited everything',
                'Custom branding',
                'White-label option',
                'API access',
                'Dedicated support'
            ],
            attribution: false
        }
    },

    // Initialize
    init() {
        this.setupEventListeners();
        this.updateLicenseUI();
    },

    // Setup event listeners
    setupEventListeners() {
        // Upgrade buttons in settings
        document.querySelectorAll('.btn-upgrade').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const plan = e.target.dataset.plan;
                this.showUpgradeModal(plan);
            });
        });
    },

    // Get current license
    getCurrentLicense() {
        const userTier = UserManager.getState().tier;
        return this.licenses[userTier] || this.licenses.free;
    },

    // Check if attribution is required
    requiresAttribution() {
        const license = this.getCurrentLicense();
        return license.attribution;
    },

    // Add attribution to code
    addAttribution(code) {
        if (!this.requiresAttribution()) {
            return code;
        }

        const attribution = `
<!--
    ========================================
    Built with AppForge - appforge.dev
    From Imagination to Installation
    ========================================
-->
`;

        // Insert after doctype or at the beginning
        if (code.toLowerCase().includes('<!doctype html>')) {
            return code.replace(/<!doctype html>/i, `<!DOCTYPE html>${attribution}`);
        } else {
            return attribution + code;
        }
    },

    // Add copyright notice
    addCopyright(code, owner = null) {
        const user = UserManager.getState();
        const copyrightOwner = owner || user.name || 'AppForge User';
        const year = new Date().getFullYear();

        const copyright = `
<!--
    Copyright (c) ${year} ${copyrightOwner}
    All rights reserved.
    
    Generated with AppForge - appforge.dev
    Licensed under ${this.getCurrentLicense().name} Plan
-->
`;

        if (code.toLowerCase().includes('<!doctype html>')) {
            return code.replace(/<!doctype html>/i, `<!DOCTYPE html>${copyright}`);
        } else {
            return copyright + code;
        }
    },

    // Check if feature is allowed
    isFeatureAllowed(feature) {
        const license = this.getCurrentLicense();

        // Check if feature is in features list
        const hasFeature = license.features.some(f => 
            f.toLowerCase().includes(feature.toLowerCase())
        );

        return hasFeature;
    },

    // Update license UI
    updateLicenseUI() {
        const license = this.getCurrentLicense();

        // Update license card
        const licenseCard = document.getElementById('currentLicense');
        if (licenseCard) {
            const tierEl = licenseCard.querySelector('.license-tier');
            const featuresEl = licenseCard.querySelector('.license-features');

            if (tierEl) {
                tierEl.textContent = license.name;
                tierEl.className = `license-tier tier-${UserManager.getState().tier}`;
            }

            if (featuresEl) {
                featuresEl.innerHTML = license.features.map(f => `
                    <li><i class="fas fa-check"></i> ${f}</li>
                `).join('');

                if (license.limitations) {
                    featuresEl.innerHTML += license.limitations.map(l => `
                        <li class="disabled"><i class="fas fa-times"></i> ${l}</li>
                    `).join('');
                }
            }
        }

        // Update footer license note
        const licenseNote = document.getElementById('licenseNote');
        if (licenseNote) {
            if (license.attribution) {
                licenseNote.style.display = 'block';
            } else {
                licenseNote.style.display = 'none';
            }
        }
    },

    // Show upgrade modal
    showUpgradeModal(plan) {
        const license = this.licenses[plan];
        if (!license) return;

        // Create modal content
        const modalContent = `
            <div class="upgrade-modal">
                <h3>Upgrade to ${license.name}</h3>
                <div class="upgrade-price">
                    $${license.price}<span>/${license.period}</span>
                </div>
                <ul class="upgrade-features">
                    ${license.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
                </ul>
                <button class="btn-primary btn-checkout" data-plan="${plan}">
                    <i class="fas fa-credit-card"></i> Proceed to Checkout
                </button>
            </div>
        `;

        // Show in a modal (simplified)
        UIManager.toast(`Upgrade to ${license.name} - Coming soon!`, 'info');
    },

    // Validate license key (for future use)
    async validateLicenseKey(key) {
        // In a real app, this would validate against a server
        // For now, just check format
        const keyRegex = /^AF-[A-Z0-9]{8}-[A-Z0-9]{8}-[A-Z0-9]{8}$/;
        return keyRegex.test(key);
    },

    // Generate license key (for admin use)
    generateLicenseKey(tier = 'pro') {
        const segments = [];
        for (let i = 0; i < 3; i++) {
            segments.push(Math.random().toString(36).substring(2, 10).toUpperCase());
        }
        return `AF-${segments.join('-')}`;
    },

    // Get export limit for current tier
    getExportLimit(type) {
        const tier = UserManager.getState().tier;
        const limits = {
            free: { pwa: 3, apk: 0, ios: 0 },
            pro: { pwa: Infinity, apk: 10, ios: 0 },
            team: { pwa: Infinity, apk: Infinity, ios: Infinity }
        };

        return limits[tier]?.[type] || 0;
    },

    // Check if can export
    canExport(type) {
        const limit = this.getExportLimit(type);
        if (limit === Infinity) return true;

        const usage = UserManager.getState().usage;
        const used = usage[`${type}Exports`] || usage[`${type}Builds`] || 0;

        return used < limit;
    },

    // Get remaining exports
    getRemainingExports(type) {
        const limit = this.getExportLimit(type);
        if (limit === Infinity) return 'Unlimited';

        const usage = UserManager.getState().usage;
        const used = usage[`${type}Exports`] || usage[`${type}Builds`] || 0;

        return Math.max(0, limit - used);
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    LicenseManager.init();
});

window.LicenseManager = LicenseManager;
