// ===== USER MANAGER =====
// Handles user accounts and tracking

class UserManager {
    constructor() {
        this.user = null;
        this.userStats = {
            appsGenerated: 0,
            exportsUsed: 0,
            lastExport: null
        };
        
        this.init();
    }
    
    init() {
        this.loadUser();
        this.initUserUI();
    }
    
    loadUser() {
        const savedUser = StorageManager.get('appforge-user');
        if (savedUser) {
            this.user = savedUser;
            this.userStats = StorageManager.get('appforge-user-stats', this.userStats);
        }
    }
    
    initUserUI() {
        // Add user menu to header
        this.addUserMenu();
    }
    
    addUserMenu() {
        const header = document.querySelector('header .navbar');
        if (!header) return;
        
        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.innerHTML = `
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-info">
                <div class="user-name">${this.user ? this.user.name : 'Guest'}</div>
                <div class="user-stats">${this.userStats.appsGenerated} apps generated</div>
            </div>
            <button class="user-menu-btn">
                <i class="fas fa-chevron-down"></i>
            </button>
        `;
        
        // Add dropdown menu
        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown hidden';
        dropdown.innerHTML = `
            <div class="dropdown-item" id="userProfileBtn">
                <i class="fas fa-user-circle"></i> Profile
            </div>
            <div class="dropdown-item" id="userStatsBtn">
                <i class="fas fa-chart-bar"></i> Statistics
            </div>
            <div class="dropdown-item" id="userSettingsBtn">
                <i class="fas fa-cog"></i> Settings
            </div>
            <div class="dropdown-divider"></div>
            ${this.user ? `
                <div class="dropdown-item" id="logoutBtn">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </div>
            ` : `
                <div class="dropdown-item" id="loginBtn">
                    <i class="fas fa-sign-in-alt"></i> Login/Register
                </div>
            `}
        `;
        
        userMenu.appendChild(dropdown);
        header.appendChild(userMenu);
        
        // Toggle dropdown
        userMenu.querySelector('.user-menu-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });
        
        // Close dropdown when clicking elsewhere
        document.addEventListener('click', () => {
            dropdown.classList.add('hidden');
        });
        
        // Dropdown actions
        dropdown.querySelector('#loginBtn')?.addEventListener('click', () => {
            this.showLoginModal();
        });
        
        dropdown.querySelector('#logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });
        
        dropdown.querySelector('#userStatsBtn')?.addEventListener('click', () => {
            this.showStatsModal();
        });
    }
    
    showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-user-plus"></i> Create Account</h2>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="userName">Name</label>
                        <input type="text" id="userName" class="form-control" placeholder="Your name">
                    </div>
                    <div class="form-group">
                        <label for="userEmail">Email</label>
                        <input type="email" id="userEmail" class="form-control" placeholder="your@email.com">
                    </div>
                    <div class="form-group">
                        <label for="userCompany">Company (Optional)</label>
                        <input type="text" id="userCompany" class="form-control" placeholder="Your company">
                    </div>
                    
                    <div class="login-benefits" style="margin-top: 30px; padding: 20px; background: var(--gray-100); border-radius: var(--radius-md);">
                        <h4><i class="fas fa-gift"></i> Account Benefits</h4>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Save and manage your generated apps</li>
                            <li>Track usage statistics</li>
                            <li>Export history</li>
                            <li>Early access to new features</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeLoginModal">
                        Cancel
                    </button>
                    <button class="btn btn-primary" id="createAccountBtn">
                        <i class="fas fa-user-plus"></i> Create Account
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('#closeLoginModal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#createAccountBtn').addEventListener('click', () => {
            const name = modal.querySelector('#userName').value.trim();
            const email = modal.querySelector('#userEmail').value.trim();
            const company = modal.querySelector('#userCompany').value.trim();
            
            if (name && email && Validator.isEmail(email)) {
                this.createAccount({ name, email, company });
                modal.remove();
            } else {
                showToast('Please enter valid name and email', 'error');
            }
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    createAccount(userData) {
        this.user = {
            id: 'user-' + Date.now(),
            ...userData,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        // Save user data
        StorageManager.set('appforge-user', this.user);
        StorageManager.set('appforge-user-stats', this.userStats);
        
        // Update UI
        this.updateUserUI();
        
        showToast('Account created successfully!', 'success');
        
        // Send to analytics (optional)
        this.trackEvent('account_created');
    }
    
    updateUserUI() {
        // Update user menu
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.querySelector('.user-name').textContent = this.user.name;
        }
    }
    
    logout() {
        this.user = null;
        StorageManager.remove('appforge-user');
        this.updateUserUI();
        showToast('Logged out successfully', 'info');
    }
    
    trackAppGenerated() {
        this.userStats.appsGenerated++;
        this.saveStats();
    }
    
    trackExport() {
        this.userStats.exportsUsed++;
        this.userStats.lastExport = new Date().toISOString();
        this.saveStats();
    }
    
    saveStats() {
        if (this.user) {
            StorageManager.set('appforge-user-stats', this.userStats);
        }
    }
    
    showStatsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-chart-bar"></i> Your Statistics</h2>
                </div>
                <div class="modal-body">
                    <div class="stats-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px;">
                        <div class="stat-card" style="text-align: center; padding: 20px; background: var(--primary-light); border-radius: var(--radius-md);">
                            <div style="font-size: 2.5rem; font-weight: bold; color: var(--primary);">
                                ${this.userStats.appsGenerated}
                            </div>
                            <div style="color: var(--gray-600);">Apps Generated</div>
                        </div>
                        <div class="stat-card" style="text-align: center; padding: 20px; background: var(--success-light); border-radius: var(--radius-md);">
                            <div style="font-size: 2.5rem; font-weight: bold; color: var(--success);">
                                ${this.userStats.exportsUsed}
                            </div>
                            <div style="color: var(--gray-600);">Exports Used</div>
                        </div>
                    </div>
                    
                    <div class="license-info">
                        <h3>License Usage</h3>
                        <div class="progress-bar" style="height: 20px; background: var(--gray-200); border-radius: var(--radius-full); overflow: hidden; margin: 10px 0;">
                            <div class="progress-fill" style="height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); width: ${Math.min(100, (this.userStats.exportsUsed / 10) * 100)}%;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--gray-600);">
                            <span>${this.userStats.exportsUsed} of 10 exports used</span>
                            <span>${10 - this.userStats.exportsUsed} remaining</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeStatsModal">
                        Close
                    </button>
                    <button class="btn btn-primary" id="resetStatsBtn">
                        Reset Statistics
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('#closeStatsModal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#resetStatsBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset your statistics?')) {
                this.userStats = {
                    appsGenerated: 0,
                    exportsUsed: 0,
                    lastExport: null
                };
                this.saveStats();
                modal.remove();
                showToast('Statistics reset successfully', 'success');
            }
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    trackEvent(eventName, data = {}) {
        // Send analytics event
        const analyticsData = {
            event: eventName,
            userId: this.user?.id || 'anonymous',
            timestamp: new Date().toISOString(),
            ...data
        };
        
        // Log to console (in production, send to your analytics server)
        console.log('Analytics:', analyticsData);
        
        // You can integrate with Google Analytics, Mixpanel, etc.
        if (window.gtag) {
            gtag('event', eventName, analyticsData);
        }
    }
}

// Initialize User Manager
let userManager = null;

function initUserManager() {
    userManager = new UserManager();
    window.userManager = userManager;
    console.log('User Manager initialized');
}

// Export
window.initUserManager = initUserManager;