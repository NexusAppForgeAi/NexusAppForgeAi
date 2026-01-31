// User Manager for AppForge
class UserManager {
    constructor() {
        this.utils = window.utils;
        this.uiManager = window.uiManager;
        this.currentUser = null;
        this.users = [];
        this.init();
    }

    init() {
        this.loadUsers();
        this.loadCurrentUser();
        this.setupEventListeners();
        this.updateUserUI();
    }

    loadUsers() {
        this.users = this.utils.getStorage('users', []);
    }

    loadCurrentUser() {
        const userId = this.utils.getStorage('current_user_id', null);
        if (userId) {
            this.currentUser = this.users.find(user => user.id === userId) || this.createGuestUser();
        } else {
            this.currentUser = this.createGuestUser();
        }
        
        // Start user session
        this.startSession();
    }

    createGuestUser() {
        return {
            id: 'guest_' + this.utils.randomId(8),
            type: 'guest',
            name: 'Guest',
            email: null,
            avatar: '👤',
            stats: {
                appsCreated: 0,
                aiGenerations: 0,
                pwaExports: 0,
                apkBuilds: 0,
                lastActive: new Date().toISOString(),
                joinDate: new Date().toISOString()
            },
            preferences: {
                theme: 'auto',
                autosave: true,
                notifications: true,
                language: 'en'
            },
            projects: [],
            favorites: [],
            createdAt: new Date().toISOString()
        };
    }

    setupEventListeners() {
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLoginModal());
        }

        // Register button
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.showRegisterModal());
        }

        // User menu
        const userName = document.getElementById('userName');
        if (userName) {
            userName.addEventListener('click', (e) => {
                const dropdown = e.target.nextElementSibling;
                if (dropdown) {
                    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                }
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                const dropdown = document.querySelector('.user-dropdown');
                if (dropdown) {
                    dropdown.style.display = 'none';
                }
            }
        });

        // Track user activity
        this.setupActivityTracking();
    }

    setupActivityTracking() {
        // Track active time
        let activeTime = 0;
        const activityInterval = setInterval(() => {
            if (document.hasFocus()) {
                activeTime++;
                if (activeTime % 60 === 0) {
                    this.updateUserActivity();
                }
            }
        }, 1000);

        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.updateUserActivity();
            }
        });

        // Track clicks and interactions
        document.addEventListener('click', () => this.updateUserActivity());
        document.addEventListener('keydown', () => this.updateUserActivity());
    }

    updateUserActivity() {
        if (this.currentUser) {
            this.currentUser.stats.lastActive = new Date().toISOString();
            this.saveCurrentUser();
        }
    }

    startSession() {
        const session = {
            userId: this.currentUser.id,
            startTime: new Date().toISOString(),
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            events: []
        };

        this.utils.setStorage('current_session', session);
        this.utils.trackEvent('session_started', {
            userType: this.currentUser.type,
            userId: this.currentUser.id
        });
    }

    endSession() {
        const session = this.utils.getStorage('current_session');
        if (session) {
            session.endTime = new Date().toISOString();
            session.duration = new Date(session.endTime) - new Date(session.startTime);
            
            const sessions = this.utils.getStorage('user_sessions', []);
            sessions.push(session);
            this.utils.setStorage('user_sessions', sessions.slice(-100)); // Keep last 100 sessions
            
            this.utils.removeStorage('current_session');
            
            this.utils.trackEvent('session_ended', {
                duration: session.duration,
                eventCount: session.events.length
            });
        }
    }

    showLoginModal() {
        this.uiManager.showModal(
            'Login to AppForge',
            this.getLoginFormHTML(),
            { footer: this.getLoginFormFooter() }
        );

        setTimeout(() => {
            const loginForm = document.getElementById('loginForm');
            const guestLoginBtn = document.getElementById('guestLoginBtn');

            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleLogin(e.target);
                });
            }

            if (guestLoginBtn) {
                guestLoginBtn.addEventListener('click', () => {
                    this.loginAsGuest();
                    this.uiManager.closeModal();
                });
            }
        }, 100);
    }

    getLoginFormHTML() {
        return `
            <div class="login-form">
                <div class="social-login">
                    <button class="btn btn-outline btn-social" disabled>
                        <span>📘</span> Continue with Facebook
                    </button>
                    <button class="btn btn-outline btn-social" disabled>
                        <span>🐦</span> Continue with Twitter
                    </button>
                    <button class="btn btn-outline btn-social" disabled>
                        <span>🔑</span> Continue with Google
                    </button>
                </div>
                
                <div class="divider">
                    <span>or</span>
                </div>
                
                <form id="loginForm">
                    <div class="form-group">
                        <label for="loginEmail">Email</label>
                        <input type="email" id="loginEmail" placeholder="your@email.com" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Password</label>
                        <input type="password" id="loginPassword" placeholder="••••••••" required>
                    </div>
                    <div class="form-options">
                        <label>
                            <input type="checkbox" name="remember"> Remember me
                        </label>
                        <a href="#" class="forgot-password">Forgot password?</a>
                    </div>
                </form>
                
                <div class="guest-option">
                    <p>Don't have an account? Continue as guest or register.</p>
                    <button class="btn btn-outline" id="guestLoginBtn">Continue as Guest</button>
                </div>
            </div>
        `;
    }

    getLoginFormFooter() {
        return `
            <button class="btn btn-outline" onclick="uiManager.closeModal()">Cancel</button>
            <button type="submit" form="loginForm" class="btn btn-primary">Login</button>
        `;
    }

    showRegisterModal() {
        this.uiManager.showModal(
            'Create Account',
            this.getRegisterFormHTML(),
            { footer: this.getRegisterFormFooter() }
        );

        setTimeout(() => {
            const registerForm = document.getElementById('registerForm');
            if (registerForm) {
                registerForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleRegistration(e.target);
                });
            }
        }, 100);
    }

    getRegisterFormHTML() {
        return `
            <div class="register-form">
                <form id="registerForm">
                    <div class="form-group">
                        <label for="registerName">Full Name</label>
                        <input type="text" id="registerName" placeholder="John Doe" required>
                    </div>
                    <div class="form-group">
                        <label for="registerEmail">Email</label>
                        <input type="email" id="registerEmail" placeholder="your@email.com" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="registerPassword">Password</label>
                            <input type="password" id="registerPassword" placeholder="••••••••" required minlength="8">
                        </div>
                        <div class="form-group">
                            <label for="registerConfirm">Confirm Password</label>
                            <input type="password" id="registerConfirm" placeholder="••••••••" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="registerAvatar">Avatar</label>
                        <div class="avatar-selection">
                            ${['👤', '👨‍💻', '👩‍💻', '🧑‍🎨', '🤖', '🎨', '🚀', '⭐'].map(emoji => `
                                <div class="avatar-option" data-emoji="${emoji}">${emoji}</div>
                            `).join('')}
                        </div>
                        <input type="hidden" id="selectedAvatar" value="👤">
                    </div>
                    <div class="form-options">
                        <label>
                            <input type="checkbox" name="terms" required>
                            I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                        </label>
                        <label>
                            <input type="checkbox" name="newsletter">
                            Send me updates and tips
                        </label>
                    </div>
                </form>
            </div>
        `;
    }

    getRegisterFormFooter() {
        return `
            <button class="btn btn-outline" onclick="uiManager.closeModal()">Cancel</button>
            <button type="submit" form="registerForm" class="btn btn-primary">Create Account</button>
        `;
    }

    handleLogin(form) {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        // Validate inputs
        if (!this.utils.isValidEmail(email)) {
            this.uiManager.showToast('Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 6) {
            this.uiManager.showToast('Password must be at least 6 characters', 'error');
            return;
        }

        // Find user (simulated)
        const user = this.users.find(u => u.email === email);
        
        if (!user) {
            this.uiManager.showToast('User not found. Please register.', 'error');
            return;
        }

        // In production, verify password hash
        this.currentUser = user;
        this.utils.setStorage('current_user_id', user.id);
        
        this.uiManager.closeModal();
        this.uiManager.showToast(`Welcome back, ${user.name}!`, 'success');
        
        this.updateUserUI();
        this.utils.trackEvent('user_logged_in', { userId: user.id });
    }

    handleRegistration(form) {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirm = document.getElementById('registerConfirm').value;
        const avatar = document.getElementById('selectedAvatar').value;

        // Validate inputs
        if (!name) {
            this.uiManager.showToast('Please enter your name', 'error');
            return;
        }

        if (!this.utils.isValidEmail(email)) {
            this.uiManager.showToast('Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 8) {
            this.uiManager.showToast('Password must be at least 8 characters', 'error');
            return;
        }

        if (password !== confirm) {
            this.uiManager.showToast('Passwords do not match', 'error');
            return;
        }

        // Check if user already exists
        if (this.users.some(u => u.email === email)) {
            this.uiManager.showToast('Email already registered', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: 'user_' + this.utils.randomId(12),
            type: 'registered',
            name: name,
            email: email,
            avatar: avatar,
            stats: {
                appsCreated: 0,
                aiGenerations: 0,
                pwaExports: 0,
                apkBuilds: 0,
                lastActive: new Date().toISOString(),
                joinDate: new Date().toISOString()
            },
            preferences: {
                theme: 'auto',
                autosave: true,
                notifications: true,
                language: 'en'
            },
            projects: [],
            favorites: [],
            createdAt: new Date().toISOString()
        };

        // Add to users list
        this.users.push(newUser);
        this.utils.setStorage('users', this.users);

        // Login new user
        this.currentUser = newUser;
        this.utils.setStorage('current_user_id', newUser.id);
        
        this.uiManager.closeModal();
        this.uiManager.showToast(`Welcome to AppForge, ${name}!`, 'success');
        
        this.updateUserUI();
        this.utils.trackEvent('user_registered', { userId: newUser.id });
    }

    loginAsGuest() {
        this.currentUser = this.createGuestUser();
        this.utils.setStorage('current_user_id', this.currentUser.id);
        
        this.uiManager.showToast('Continuing as guest', 'info');
        this.updateUserUI();
        this.utils.trackEvent('guest_login');
    }

    logout() {
        const oldUser = this.currentUser;
        
        this.endSession();
        this.currentUser = this.createGuestUser();
        this.utils.removeStorage('current_user_id');
        
        this.uiManager.showToast('Logged out successfully', 'info');
        this.updateUserUI();
        this.utils.trackEvent('user_logged_out', { userId: oldUser.id });
    }

    saveCurrentUser() {
        if (!this.currentUser) return;

        // Update user in users array if registered
        if (this.currentUser.type === 'registered') {
            const index = this.users.findIndex(u => u.id === this.currentUser.id);
            if (index !== -1) {
                this.users[index] = this.currentUser;
                this.utils.setStorage('users', this.users);
            }
        }

        // Save guest user data separately
        if (this.currentUser.type === 'guest') {
            this.utils.setStorage('guest_user', this.currentUser);
        }
    }

    updateUserUI() {
        // Update user name display
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = this.currentUser.name;
            userName.title = this.currentUser.type === 'guest' ? 'Guest User' : this.currentUser.email;
        }

        // Update user dropdown
        const userDropdown = document.querySelector('.user-dropdown');
        if (userDropdown) {
            if (this.currentUser.type === 'guest') {
                userDropdown.innerHTML = `
                    <button id="loginBtn">Login</button>
                    <button id="registerBtn">Register</button>
                    <button id="upgradeBtn">Upgrade to Pro</button>
                `;
            } else {
                userDropdown.innerHTML = `
                    <button id="profileBtn">Profile</button>
                    <button id="settingsBtn">Settings</button>
                    <button id="upgradeBtn">Upgrade to Pro</button>
                    <hr>
                    <button id="logoutBtn">Logout</button>
                `;
            }

            // Reattach event listeners
            setTimeout(() => {
                const loginBtn = document.getElementById('loginBtn');
                const registerBtn = document.getElementById('registerBtn');
                const logoutBtn = document.getElementById('logoutBtn');
                const profileBtn = document.getElementById('profileBtn');
                const settingsBtn = document.getElementById('settingsBtn');
                const upgradeBtn = document.getElementById('upgradeBtn');

                if (loginBtn) loginBtn.addEventListener('click', () => this.showLoginModal());
                if (registerBtn) registerBtn.addEventListener('click', () => this.showRegisterModal());
                if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());
                if (profileBtn) profileBtn.addEventListener('click', () => this.showProfile());
                if (settingsBtn) settingsBtn.addEventListener('click', () => this.showSettings());
                if (upgradeBtn) upgradeBtn.addEventListener('click', () => window.licenseManager?.showUpgradeModal());
            }, 100);
        }

        // Update stats in account tab
        this.updateUserStats();
    }

    updateUserStats() {
        const stats = this.currentUser.stats;
        
        // Update account tab stats
        const appsCreated = document.getElementById('appsCreated');
        const aiGenerations = document.getElementById('aiGenerations');
        const pwaExports = document.getElementById('pwaExports');
        const apkBuilds = document.getElementById('apkBuilds');

        if (appsCreated) appsCreated.textContent = stats.appsCreated || 0;
        if (aiGenerations) aiGenerations.textContent = stats.aiGenerations || 0;
        if (pwaExports) pwaExports.textContent = stats.pwaExports || 0;
        if (apkBuilds) apkBuilds.textContent = stats.apkBuilds || 0;
    }

    incrementStat(statName, amount = 1) {
        if (!this.currentUser.stats[statName]) {
            this.currentUser.stats[statName] = 0;
        }
        
        this.currentUser.stats[statName] += amount;
        this.saveCurrentUser();
        this.updateUserStats();
        
        this.utils.trackEvent('user_stat_updated', { stat: statName, value: this.currentUser.stats[statName] });
    }

    showProfile() {
        this.uiManager.showModal(
            'Your Profile',
            this.getProfileHTML(),
            { footer: this.getProfileFooter() }
        );
    }

    getProfileHTML() {
        const joinDate = new Date(this.currentUser.stats.joinDate).toLocaleDateString();
        const lastActive = new Date(this.currentUser.stats.lastActive).toLocaleDateString();
        
        return `
            <div class="user-profile">
                <div class="profile-header">
                    <div class="profile-avatar">${this.currentUser.avatar}</div>
                    <div class="profile-info">
                        <h3>${this.currentUser.name}</h3>
                        <p>${this.currentUser.email || 'Guest User'}</p>
                        <span class="user-badge ${this.currentUser.type}">${this.currentUser.type.toUpperCase()}</span>
                    </div>
                </div>
                
                <div class="profile-stats">
                    <h4>Activity Stats</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-label">Apps Created</div>
                            <div class="stat-value">${this.currentUser.stats.appsCreated || 0}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">AI Generations</div>
                            <div class="stat-value">${this.currentUser.stats.aiGenerations || 0}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">PWA Exports</div>
                            <div class="stat-value">${this.currentUser.stats.pwaExports || 0}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">APK Builds</div>
                            <div class="stat-value">${this.currentUser.stats.apkBuilds || 0}</div>
                        </div>
                    </div>
                </div>
                
                <div class="profile-details">
                    <h4>Account Details</h4>
                    <div class="detail-list">
                        <div class="detail-item">
                            <span class="detail-label">Member Since</span>
                            <span class="detail-value">${joinDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Last Active</span>
                            <span class="detail-value">${lastActive}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">User Type</span>
                            <span class="detail-value">${this.currentUser.type.toUpperCase()}</span>
                        </div>
                        ${this.currentUser.email ? `
                        <div class="detail-item">
                            <span class="detail-label">Email</span>
                            <span class="detail-value">${this.currentUser.email}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                ${this.currentUser.type === 'guest' ? `
                <div class="guest-upgrade">
                    <h4>✨ Get More Features</h4>
                    <p>Create an account to save your projects and access them from any device.</p>
                    <button class="btn btn-primary" id="registerFromProfile">Create Account</button>
                </div>
                ` : ''}
            </div>
        `;
    }

    getProfileFooter() {
        return `
            <button class="btn btn-outline" onclick="uiManager.closeModal()">Close</button>
            ${this.currentUser.type !== 'guest' ? 
                '<button class="btn btn-primary" id="editProfileBtn">Edit Profile</button>' : ''}
        `;
    }

    showSettings() {
        this.uiManager.showModal(
            'Settings',
            this.getSettingsHTML(),
            { footer: this.getSettingsFooter() }
        );

        setTimeout(() => {
            this.initSettingsForm();
        }, 100);
    }

    getSettingsHTML() {
        return `
            <div class="user-settings">
                <div class="settings-tabs">
                    <button class="settings-tab active" data-tab="general">General</button>
                    <button class="settings-tab" data-tab="editor">Editor</button>
                    <button class="settings-tab" data-tab="notifications">Notifications</button>
                    <button class="settings-tab" data-tab="data">Data</button>
                </div>
                
                <div class="settings-content">
                    <div id="generalTab" class="settings-tab-content active">
                        <div class="form-group">
                            <label for="settingsTheme">Theme</label>
                            <select id="settingsTheme">
                                <option value="auto" ${this.currentUser.preferences.theme === 'auto' ? 'selected' : ''}>Auto (System)</option>
                                <option value="light" ${this.currentUser.preferences.theme === 'light' ? 'selected' : ''}>Light</option>
                                <option value="dark" ${this.currentUser.preferences.theme === 'dark' ? 'selected' : ''}>Dark</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="settingsLanguage">Language</label>
                            <select id="settingsLanguage">
                                <option value="en" ${this.currentUser.preferences.language === 'en' ? 'selected' : ''}>English</option>
                                <option value="es" ${this.currentUser.preferences.language === 'es' ? 'selected' : ''}>Spanish</option>
                                <option value="fr" ${this.currentUser.preferences.language === 'fr' ? 'selected' : ''}>French</option>
                                <option value="de" ${this.currentUser.preferences.language === 'de' ? 'selected' : ''}>German</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="settingsAutosave" ${this.currentUser.preferences.autosave ? 'checked' : ''}>
                                Enable auto-save
                            </label>
                        </div>
                    </div>
                    
                    <div id="editorTab" class="settings-tab-content">
                        <div class="form-group">
                            <label for="editorFontSize">Font Size</label>
                            <input type="range" id="editorFontSize" min="12" max="24" value="14">
                            <span id="fontSizeValue">14px</span>
                        </div>
                        <div class="form-group">
                            <label for="editorTabSize">Tab Size</label>
                            <select id="editorTabSize">
                                <option value="2">2 spaces</option>
                                <option value="4" selected>4 spaces</option>
                                <option value="8">8 spaces</option>
                                <option value="tab">Tab character</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="editorLineNumbers" checked>
                                Show line numbers
                            </label>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="editorWordWrap" checked>
                                Enable word wrap
                            </label>
                        </div>
                    </div>
                    
                    <div id="notificationsTab" class="settings-tab-content">
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="notifySuccess" checked>
                                Success notifications
                            </label>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="notifyError" checked>
                                Error notifications
                            </label>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="notifyUpdates">
                                Update notifications
                            </label>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="notifyPromotions">
                                Promotional offers
                            </label>
                        </div>
                    </div>
                    
                    <div id="dataTab" class="settings-tab-content">
                        <div class="form-group">
                            <label>Export User Data</label>
                            <button class="btn btn-outline" id="exportDataBtn">Export All Data</button>
                            <small>Download a copy of your projects and settings</small>
                        </div>
                        <div class="form-group">
                            <label>Clear Local Data</label>
                            <button class="btn btn-outline" id="clearDataBtn">Clear All Data</button>
                            <small>Remove all locally stored data (projects will be lost)</small>
                        </div>
                        <div class="form-group">
                            <label>Delete Account</label>
                            <button class="btn btn-danger" id="deleteAccountBtn" disabled>Delete Account</button>
                            <small>Account deletion is not available in the demo</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getSettingsFooter() {
        return `
            <button class="btn btn-outline" onclick="uiManager.closeModal()">Cancel</button>
            <button class="btn btn-primary" id="saveSettingsBtn">Save Settings</button>
        `;
    }

    initSettingsForm() {
        // Tab switching
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                
                document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                document.querySelectorAll('.settings-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                document.getElementById(tabName + 'Tab').classList.add('active');
            });
        });

        // Font size slider
        const fontSizeSlider = document.getElementById('editorFontSize');
        const fontSizeValue = document.getElementById('fontSizeValue');
        
        if (fontSizeSlider && fontSizeValue) {
            fontSizeSlider.addEventListener('input', () => {
                fontSizeValue.textContent = fontSizeSlider.value + 'px';
            });
        }

        // Save settings button
        const saveBtn = document.getElementById('saveSettingsBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }

        // Export data button
        const exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportUserData());
        }

        // Clear data button
        const clearBtn = document.getElementById('clearDataBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearUserData());
        }
    }

    saveSettings() {
        // General settings
        this.currentUser.preferences.theme = document.getElementById('settingsTheme').value;
        this.currentUser.preferences.language = document.getElementById('settingsLanguage').value;
        this.currentUser.preferences.autosave = document.getElementById('settingsAutosave').checked;

        // Apply theme
        if (this.currentUser.preferences.theme === 'auto') {
            // Use system preference
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.utils.setTheme(isDark ? 'dark' : 'light');
        } else {
            this.utils.setTheme(this.currentUser.preferences.theme);
        }

        // Save user
        this.saveCurrentUser();
        
        this.uiManager.closeModal();
        this.uiManager.showToast('Settings saved', 'success');
        this.utils.trackEvent('settings_saved');
    }

    exportUserData() {
        const exportData = {
            user: this.currentUser,
            projects: this.utils.getStorage('projects', []),
            templates: this.utils.getStorage('templates', []),
            settings: this.utils.getStorage('settings', {}),
            exportStats: this.utils.getStorage('export_stats', {}),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const filename = `appforge-data-${this.currentUser.id}-${new Date().toISOString().split('T')[0]}.json`;
        this.utils.downloadFile(filename, JSON.stringify(exportData, null, 2), 'application/json');
        
        this.uiManager.showToast('Data exported successfully', 'success');
        this.utils.trackEvent('data_exported');
    }

    clearUserData() {
        this.uiManager.confirm(
            'Are you sure you want to clear all local data? This will remove all your projects and settings.',
            'Clear All Data'
        ).then(confirmed => {
            if (confirmed) {
                this.utils.clearStorage();
                
                // Reset current user
                this.currentUser = this.createGuestUser();
                this.utils.setStorage('current_user_id', this.currentUser.id);
                
                this.uiManager.closeModal();
                this.uiManager.showToast('All data cleared', 'info');
                this.updateUserUI();
                
                // Reload page to reset everything
                setTimeout(() => location.reload(), 1000);
            }
        });
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isGuest() {
        return this.currentUser.type === 'guest';
    }

    isRegistered() {
        return this.currentUser.type === 'registered';
    }

    getUserStats() {
        return this.currentUser.stats;
    }

    updatePreferences(preferences) {
        this.currentUser.preferences = { ...this.currentUser.preferences, ...preferences };
        this.saveCurrentUser();
    }

    addProject(project) {
        this.currentUser.projects.push({
            id: this.utils.randomId(8),
            ...project,
            createdAt: new Date().toISOString()
        });
        
        this.saveCurrentUser();
        this.incrementStat('appsCreated');
    }

    getProjects() {
        return this.currentUser.projects;
    }

    getProject(id) {
        return this.currentUser.projects.find(p => p.id === id);
    }

    deleteProject(id) {
        const index = this.currentUser.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            this.currentUser.projects.splice(index, 1);
            this.saveCurrentUser();
            return true;
        }
        return false;
    }

    addFavorite(itemId, type = 'template') {
        if (!this.currentUser.favorites.some(fav => fav.id === itemId && fav.type === type)) {
            this.currentUser.favorites.push({ id: itemId, type, addedAt: new Date().toISOString() });
            this.saveCurrentUser();
            return true;
        }
        return false;
    }

    removeFavorite(itemId, type = 'template') {
        const index = this.currentUser.favorites.findIndex(fav => fav.id === itemId && fav.type === type);
        if (index !== -1) {
            this.currentUser.favorites.splice(index, 1);
            this.saveCurrentUser();
            return true;
        }
        return false;
    }

    getFavorites(type = null) {
        if (type) {
            return this.currentUser.favorites.filter(fav => fav.type === type);
        }
        return this.currentUser.favorites;
    }
}

// Create global instance
window.userManager = new UserManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserManager;
}
