// License Manager for AppForge
class LicenseManager {
    constructor() {
        this.utils = window.utils;
        this.uiManager = window.uiManager;
        this.license = null;
        this.exportLimits = {
            free: { pwa: 3, apk: 0 },
            pro: { pwa: 999, apk: 10 },
            team: { pwa: 9999, apk: 999 }
        };
        this.init();
    }

    init() {
        this.loadLicense();
        this.setupEventListeners();
        this.updateLicenseUI();
    }

    loadLicense() {
        this.license = this.utils.getStorage('license', {
            type: 'free',
            expiresAt: null,
            features: this.getDefaultFeatures('free'),
            exports: this.getDefaultExports('free'),
            createdAt: new Date().toISOString()
        });
    }

    getDefaultFeatures(licenseType) {
        const features = {
            free: {
                aiGenerations: true,
                basicTemplates: true,
                htmlExport: true,
                pwaExport: true,
                apkExport: false,
                removeBranding: false,
                prioritySupport: false,
                teamCollaboration: false,
                whiteLabel: false
            },
            pro: {
                aiGenerations: true,
                basicTemplates: true,
                htmlExport: true,
                pwaExport: true,
                apkExport: true,
                removeBranding: true,
                prioritySupport: true,
                teamCollaboration: false,
                whiteLabel: false
            },
            team: {
                aiGenerations: true,
                basicTemplates: true,
                htmlExport: true,
                pwaExport: true,
                apkExport: true,
                removeBranding: true,
                prioritySupport: true,
                teamCollaboration: true,
                whiteLabel: true
            }
        };
        
        return features[licenseType] || features.free;
    }

    getDefaultExports(licenseType) {
        return {
            pwa: 0,
            apk: 0,
            resetDate: new Date().toISOString()
        };
    }

    setupEventListeners() {
        // Check for license updates
        document.addEventListener('appLoaded', () => {
            this.validateLicense();
        });

        // Export tracking
        document.addEventListener('exportCompleted', (e) => {
            if (e.detail && e.detail.type) {
                this.recordExport(e.detail.type);
            }
        });
    }

    validateLicense() {
        // Check if license has expired
        if (this.license.expiresAt && new Date(this.license.expiresAt) < new Date()) {
            this.downgradeToFree();
            this.uiManager.showToast('Your license has expired. Downgraded to Free plan.', 'warning');
        }

        // Check if export limits reset is needed
        this.checkExportReset();
    }

    canExport(exportType) {
        if (!this.license.features[exportType + 'Export']) {
            return false;
        }

        const limit = this.exportLimits[this.license.type][exportType];
        if (limit === 0) return false; // Not allowed for this plan
        
        if (limit === 999 || limit === 9999) return true; // Unlimited for pro/team

        const used = this.license.exports[exportType] || 0;
        return used < limit;
    }

    recordExport(exportType) {
        if (!['pwa', 'apk'].includes(exportType)) return;

        this.license.exports[exportType] = (this.license.exports[exportType] || 0) + 1;
        this.saveLicense();
        this.updateLicenseUI();
        
        this.utils.trackEvent('export_recorded', {
            type: exportType,
            license: this.license.type,
            count: this.license.exports[exportType]
        });
    }

    checkExportReset() {
        const resetDate = new Date(this.license.exports.resetDate);
        const now = new Date();
        
        // Reset on 1st of each month
        if (now.getDate() === 1 && resetDate.getMonth() !== now.getMonth()) {
            this.resetExportCounts();
        }
    }

    resetExportCounts() {
        this.license.exports = this.getDefaultExports(this.license.type);
        this.license.exports.resetDate = new Date().toISOString();
        this.saveLicense();
        
        this.uiManager.showToast('Export limits reset for new month!', 'info');
        this.utils.trackEvent('exports_reset');
    }

    upgradeLicense(newType, duration = 'monthly') {
        const oldType = this.license.type;
        
        // Calculate expiration date
        let expiresAt = new Date();
        if (duration === 'monthly') {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else if (duration === 'yearly') {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else if (duration === 'lifetime') {
            expiresAt = null;
        }

        // Update license
        this.license.type = newType;
        this.license.expiresAt = expiresAt ? expiresAt.toISOString() : null;
        this.license.features = this.getDefaultFeatures(newType);
        
        // Reset exports for new plan
        this.license.exports = this.getDefaultExports(newType);
        
        this.saveLicense();
        this.updateLicenseUI();
        
        this.uiManager.showToast(`Upgraded to ${newType.toUpperCase()} plan!`, 'success');
        this.utils.trackEvent('license_upgraded', {
            from: oldType,
            to: newType,
            duration
        });

        return this.license;
    }

    downgradeToFree() {
        const oldType = this.license.type;
        
        this.license.type = 'free';
        this.license.expiresAt = null;
        this.license.features = this.getDefaultFeatures('free');
        
        // Keep export counts but adjust limits
        this.license.exports = this.getDefaultExports('free');
        
        this.saveLicense();
        this.updateLicenseUI();
        
        this.utils.trackEvent('license_downgraded', { from: oldType, to: 'free' });
        return this.license;
    }

    saveLicense() {
        this.utils.setStorage('license', this.license);
    }

    updateLicenseUI() {
        // Update license status display
        const licenseStatus = document.querySelector('.license-status');
        if (licenseStatus) {
            const pwaRemaining = this.getRemainingExports('pwa');
            const apkRemaining = this.getRemainingExports('apk');
            
            licenseStatus.innerHTML = `
                <span>Status: <strong>${this.license.type.toUpperCase()} Tier</strong></span>
                <span>PWA exports: <strong>${pwaRemaining}</strong></span>
                ${this.license.type !== 'free' ? 
                    `<span>APK exports: <strong>${apkRemaining}</strong></span>` : ''}
                ${this.license.type === 'free' ? 
                    '<button class="btn btn-primary" id="upgradeBtn">Upgrade to Pro</button>' : 
                    '<button class="btn btn-outline" id="manageLicenseBtn">Manage License</button>'}
            `;

            // Add event listeners
            const upgradeBtn = document.getElementById('upgradeBtn');
            if (upgradeBtn) {
                upgradeBtn.addEventListener('click', () => this.showUpgradeModal());
            }

            const manageBtn = document.getElementById('manageLicenseBtn');
            if (manageBtn) {
                manageBtn.addEventListener('click', () => this.showLicenseManagement());
            }
        }

        // Update account tab
        this.updateAccountTab();
    }

    updateAccountTab() {
        const subscriptionInfo = document.querySelector('.subscription-info');
        if (subscriptionInfo) {
            const planBadge = subscriptionInfo.querySelector('.plan-badge');
            const upgradeBtn = subscriptionInfo.querySelector('#upgradeAccountBtn');
            const description = subscriptionInfo.querySelector('p');

            if (planBadge) {
                planBadge.className = `plan-badge ${this.license.type}`;
                planBadge.textContent = `${this.license.type.toUpperCase()} Plan`;
            }

            if (upgradeBtn) {
                if (this.license.type === 'free') {
                    upgradeBtn.style.display = 'block';
                    upgradeBtn.textContent = 'Upgrade to Pro - $19/month';
                } else {
                    upgradeBtn.style.display = 'none';
                }
            }

            if (description) {
                if (this.license.type === 'free') {
                    description.textContent = 'Upgrade to unlock unlimited exports and APK building';
                } else {
                    description.textContent = `Your ${this.license.type} plan is active.`;
                    if (this.license.expiresAt) {
                        const expires = new Date(this.license.expiresAt);
                        description.textContent += ` Renews on ${expires.toLocaleDateString()}.`;
                    }
                }
            }
        }
    }

    getRemainingExports(exportType) {
        if (!this.canExport(exportType)) return '0';
        
        const limit = this.exportLimits[this.license.type][exportType];
        const used = this.license.exports[exportType] || 0;
        
        if (limit === 999 || limit === 9999) return 'Unlimited';
        return `${limit - used}/${limit}`;
    }

    showUpgradeModal() {
        this.uiManager.showModal(
            'Upgrade to Pro 🚀',
            this.getUpgradeModalHTML(),
            { footer: this.getUpgradeModalFooter() }
        );

        setTimeout(() => {
            // Add event listeners to plan selection
            document.querySelectorAll('.plan-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    document.querySelectorAll('.plan-option').forEach(o => o.classList.remove('selected'));
                    option.classList.add('selected');
                });
            });

            // Add event listener to upgrade button
            const upgradeBtn = document.getElementById('confirmUpgradeBtn');
            if (upgradeBtn) {
                upgradeBtn.addEventListener('click', () => {
                    const selectedPlan = document.querySelector('.plan-option.selected');
                    if (selectedPlan) {
                        this.processUpgrade(selectedPlan.dataset.plan);
                    } else {
                        this.uiManager.showToast('Please select a plan', 'warning');
                    }
                });
            }
        }, 100);
    }

    getUpgradeModalHTML() {
        return `
            <div class="upgrade-modal">
                <div class="plan-comparison">
                    <div class="plan-option" data-plan="pro-monthly">
                        <h4>Pro - Monthly</h4>
                        <div class="price">$19<span>/month</span></div>
                        <ul>
                            <li>✓ Unlimited AI generations</li>
                            <li>✓ All templates</li>
                            <li>✓ Unlimited PWA exports</li>
                            <li>✓ 10 APK exports/month</li>
                            <li>✓ Remove branding</li>
                            <li>✓ Priority support</li>
                        </ul>
                        <div class="popular-badge">Most Popular</div>
                    </div>
                    
                    <div class="plan-option" data-plan="pro-yearly">
                        <h4>Pro - Yearly</h4>
                        <div class="price">$190<span>/year</span></div>
                        <div class="save-badge">Save 16%</div>
                        <ul>
                            <li>✓ Everything in Monthly</li>
                            <li>✓ 2 months free</li>
                            <li>✓ Better value</li>
                        </ul>
                    </div>
                    
                    <div class="plan-option" data-plan="team">
                        <h4>Team</h4>
                        <div class="price">$99<span>/month</span></div>
                        <ul>
                            <li>✓ Everything in Pro</li>
                            <li>✓ Unlimited team members</li>
                            <li>✓ Custom branding</li>
                            <li>✓ API access</li>
                            <li>✓ White-label option</li>
                            <li>✓ Dedicated support</li>
                        </ul>
                    </div>
                </div>
                
                <div class="payment-section" style="display: none;" id="paymentSection">
                    <h4>Payment Details</h4>
                    <div class="payment-form">
                        <div class="form-group">
                            <label>Card Number</label>
                            <input type="text" placeholder="1234 5678 9012 3456" class="card-input">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Expiry Date</label>
                                <input type="text" placeholder="MM/YY">
                            </div>
                            <div class="form-group">
                                <label>CVC</label>
                                <input type="text" placeholder="123">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Email for receipt</label>
                            <input type="email" placeholder="your@email.com">
                        </div>
                    </div>
                </div>
                
                <div class="features-grid">
                    <div class="feature-item">
                        <div class="feature-icon">🚀</div>
                        <h5>Unlimited Exports</h5>
                        <p>Export as many PWAs as you need</p>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">🤖</div>
                        <h5>APK Building</h5>
                        <p>Convert web apps to Android apps</p>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">🎨</div>
                        <h5>No Branding</h5>
                        <p>Remove AppForge branding</p>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">⚡</div>
                        <h5>Priority Support</h5>
                        <p>Get help faster</p>
                    </div>
                </div>
            </div>
        `;
    }

    getUpgradeModalFooter() {
        return `
            <button class="btn btn-outline" onclick="uiManager.closeModal()">Cancel</button>
            <button class="btn btn-primary" id="confirmUpgradeBtn">Continue to Payment</button>
        `;
    }

    processUpgrade(planId) {
        // Show payment section
        const paymentSection = document.getElementById('paymentSection');
        const upgradeBtn = document.getElementById('confirmUpgradeBtn');
        
        if (paymentSection && paymentSection.style.display === 'none') {
            paymentSection.style.display = 'block';
            if (upgradeBtn) {
                upgradeBtn.textContent = 'Complete Payment';
            }
            return;
        }

        // Process payment (simulated)
        this.uiManager.showToast('Processing payment...', 'info');
        
        setTimeout(() => {
            // Determine license type from plan
            let licenseType = 'pro';
            if (planId.includes('team')) licenseType = 'team';
            
            // Upgrade license
            this.upgradeLicense(licenseType, planId.includes('yearly') ? 'yearly' : 'monthly');
            
            // Close modal
            this.uiManager.closeModal();
            
            // Show success message
            this.uiManager.showToast('Payment successful! Welcome to Pro!', 'success');
            
            this.utils.trackEvent('payment_completed', { plan: planId });
        }, 2000);
    }

    showLicenseManagement() {
        this.uiManager.showModal(
            'License Management',
            this.getLicenseManagementHTML(),
            { footer: this.getLicenseManagementFooter() }
        );
    }

    getLicenseManagementHTML() {
        const expires = this.license.expiresAt ? 
            new Date(this.license.expiresAt).toLocaleDateString() : 'Never';
        
        return `
            <div class="license-management">
                <div class="license-info-card">
                    <h4>Current License</h4>
                    <div class="license-details">
                        <div class="detail-row">
                            <span>Plan:</span>
                            <strong>${this.license.type.toUpperCase()}</strong>
                        </div>
                        <div class="detail-row">
                            <span>Status:</span>
                            <span class="status-active">Active</span>
                        </div>
                        <div class="detail-row">
                            <span>Expires:</span>
                            <span>${expires}</span>
                        </div>
                        <div class="detail-row">
                            <span>Created:</span>
                            <span>${new Date(this.license.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                
                <div class="usage-stats">
                    <h4>Export Usage (This Month)</h4>
                    <div class="usage-bars">
                        <div class="usage-bar">
                            <div class="usage-label">PWA Exports</div>
                            <div class="usage-progress">
                                <div class="progress-fill" style="width: ${this.getUsagePercentage('pwa')}%"></div>
                            </div>
                            <div class="usage-count">${this.license.exports.pwa || 0}/${this.exportLimits[this.license.type].pwa}</div>
                        </div>
                        ${this.license.type !== 'free' ? `
                        <div class="usage-bar">
                            <div class="usage-label">APK Exports</div>
                            <div class="usage-progress">
                                <div class="progress-fill" style="width: ${this.getUsagePercentage('apk')}%"></div>
                            </div>
                            <div class="usage-count">${this.license.exports.apk || 0}/${this.exportLimits[this.license.type].apk}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="license-actions">
                    <h4>Actions</h4>
                    <div class="action-buttons">
                        <button class="btn btn-outline" id="viewInvoiceBtn">View Invoices</button>
                        <button class="btn btn-outline" id="changePlanBtn">Change Plan</button>
                        ${this.license.type !== 'free' ? 
                            '<button class="btn btn-outline" id="cancelSubscriptionBtn">Cancel Subscription</button>' : ''}
                    </div>
                </div>
                
                <div class="license-key" style="display: none;" id="licenseKeySection">
                    <h4>License Key</h4>
                    <div class="key-display">
                        <code id="licenseKeyCode">APF-${this.utils.randomId(4)}-${this.utils.randomId(4)}-${this.utils.randomId(4)}</code>
                        <button class="btn btn-small" onclick="navigator.clipboard.writeText(document.getElementById('licenseKeyCode').textContent); uiManager.showToast('Copied!', 'success')">Copy</button>
                    </div>
                    <small>Use this key for API access or team management.</small>
                </div>
            </div>
        `;
    }

    getLicenseManagementFooter() {
        return `
            <button class="btn btn-outline" id="showLicenseKeyBtn">Show License Key</button>
            <button class="btn btn-primary" onclick="uiManager.closeModal()">Close</button>
        `;
    }

    getUsagePercentage(exportType) {
        const limit = this.exportLimits[this.license.type][exportType];
        const used = this.license.exports[exportType] || 0;
        
        if (limit === 999 || limit === 9999) return 0;
        if (limit === 0) return 100;
        
        return Math.min((used / limit) * 100, 100);
    }

    validateLicenseKey(key) {
        // Simple validation for demo
        const pattern = /^APF-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
        return pattern.test(key);
    }

    activateLicense(key) {
        if (!this.validateLicenseKey(key)) {
            return { success: false, message: 'Invalid license key format' };
        }

        // Parse license type from key (simplified)
        let licenseType = 'pro';
        if (key.includes('TEAM')) licenseType = 'team';
        if (key.includes('FREE')) licenseType = 'free';

        this.upgradeLicense(licenseType, 'yearly');
        
        return { 
            success: true, 
            message: `Activated ${licenseType.toUpperCase()} license` 
        };
    }

    getLicenseInfo() {
        return {
            type: this.license.type,
            expiresAt: this.license.expiresAt,
            features: this.license.features,
            exports: this.license.exports,
            limits: this.exportLimits[this.license.type]
        };
    }

    isFeatureEnabled(feature) {
        return this.license.features[feature] || false;
    }

    getAvailablePlans() {
        return {
            free: {
                price: 0,
                features: this.getDefaultFeatures('free'),
                limits: this.exportLimits.free
            },
            pro: {
                price: 19,
                features: this.getDefaultFeatures('pro'),
                limits: this.exportLimits.pro
            },
            team: {
                price: 99,
                features: this.getDefaultFeatures('team'),
                limits: this.exportLimits.team
            }
        };
    }

    addWatermark(code) {
        if (this.license.features.removeBranding) {
            return code;
        }

        const watermark = `
<!-- 
  Created with AppForge
  https://appforge.dev
  Powered by AI technology
  Try it free: appforge.dev
-->
        `.trim();

        // Insert watermark after doctype or at beginning
        if (code.includes('<!DOCTYPE')) {
            const endIndex = code.indexOf('>', code.indexOf('<!DOCTYPE')) + 1;
            return code.substring(0, endIndex) + '\n' + watermark + code.substring(endIndex);
        } else {
            return watermark + '\n' + code;
        }
    }

    enforceExportLimits() {
        // This would be called before any export
        const warnings = [];
        
        if (!this.canExport('pwa')) {
            warnings.push('PWA export limit reached. Upgrade for unlimited exports.');
        }
        
        if (!this.canExport('apk')) {
            warnings.push('APK export requires Pro plan.');
        }
        
        return warnings;
    }
}

// Create global instance
window.licenseManager = new LicenseManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LicenseManager;
}