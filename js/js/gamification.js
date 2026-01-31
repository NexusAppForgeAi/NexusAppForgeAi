// Gamification System - Achievements, badges, and leaderboards

const Gamification = {
    // User achievements
    achievements: [
        {
            id: 'first_app',
            name: 'Hello World!',
            description: 'Create your first app',
            icon: 'fa-rocket',
            color: '#4CAF50',
            condition: (stats) => stats.appsCreated >= 1
        },
        {
            id: 'five_apps',
            name: 'App Factory',
            description: 'Create 5 apps',
            icon: 'fa-industry',
            color: '#2196F3',
            condition: (stats) => stats.appsCreated >= 5
        },
        {
            id: 'ten_apps',
            name: 'Serial Builder',
            description: 'Create 10 apps',
            icon: 'fa-crown',
            color: '#FF9800',
            condition: (stats) => stats.appsCreated >= 10
        },
        {
            id: 'first_export',
            name: 'Ship It!',
            description: 'Export your first app',
            icon: 'fa-download',
            color: '#9C27B0',
            condition: (stats) => stats.exports >= 1
        },
        {
            id: 'template_master',
            name: 'Template Master',
            description: 'Use all 10 templates',
            icon: 'fa-th-large',
            color: '#E91E63',
            condition: (stats) => stats.templatesUsed >= 10
        },
        {
            id: 'voice_user',
            name: 'Voice Commander',
            description: 'Use voice input to create an app',
            icon: 'fa-microphone',
            color: '#00BCD4',
            condition: (stats) => stats.voiceUsed
        },
        {
            id: 'image_user',
            name: 'Visionary',
            description: 'Convert an image to an app',
            icon: 'fa-image',
            color: '#795548',
            condition: (stats) => stats.imageUsed
        },
        {
            id: 'night_owl',
            name: 'Night Owl',
            description: 'Build an app between midnight and 5 AM',
            icon: 'fa-moon',
            color: '#3F51B5',
            condition: (stats) => stats.nightBuild
        },
        {
            id: 'speed_demon',
            name: 'Speed Demon',
            description: 'Create 3 apps in one day',
            icon: 'fa-bolt',
            color: '#FFEB3B',
            condition: (stats) => stats.dailyApps >= 3
        },
        {
            id: 'perfectionist',
            name: 'Perfectionist',
            description: 'Fix all issues with AI Debugger',
            icon: 'fa-bug',
            color: '#f44336',
            condition: (stats) => stats.debuggerUsed && stats.issuesFixed > 0
        },
        {
            id: 'pro_member',
            name: 'Pro Member',
            description: 'Upgrade to Pro plan',
            icon: 'fa-star',
            color: '#FFD700',
            condition: (stats) => stats.tier === 'pro' || stats.tier === 'team'
        },
        {
            id: 'gallery_featured',
            name: 'Hall of Fame',
            description: 'Get your app featured in the gallery',
            icon: 'fa-trophy',
            color: '#FF5722',
            condition: (stats) => stats.featuredInGallery
        }
    ],

    // User stats
    stats: {
        appsCreated: 0,
        exports: 0,
        templatesUsed: [],
        voiceUsed: false,
        imageUsed: false,
        nightBuild: false,
        dailyApps: 0,
        debuggerUsed: false,
        issuesFixed: 0,
        tier: 'free',
        featuredInGallery: false,
        lastActive: null,
        streakDays: 0
    },

    // Initialize
    init() {
        this.loadStats();
        this.setupUI();
        this.checkAchievements();
    },

    // Load stats from storage
    loadStats() {
        const saved = Utils.storage.get('appforge_gamification');
        if (saved) {
            this.stats = { ...this.stats, ...saved };
        }
        
        // Load from user manager
        const userState = UserManager.getState();
        this.stats.tier = userState.tier;
        this.stats.appsCreated = userState.usage?.aiGenerations || 0;
        this.stats.exports = (userState.usage?.pwaExports || 0) + (userState.usage?.apkBuilds || 0);
    },

    // Save stats
    saveStats() {
        Utils.storage.set('appforge_gamification', this.stats);
    },

    // Setup UI
    setupUI() {
        // Add achievements button to nav
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            const achievementsBtn = document.createElement('button');
            achievementsBtn.id = 'achievementsBtn';
            achievementsBtn.className = 'user-btn';
            achievementsBtn.title = 'Achievements';
            achievementsBtn.innerHTML = '<i class="fas fa-trophy"></i>';
            achievementsBtn.addEventListener('click', () => this.showAchievementsModal());
            navActions.insertBefore(achievementsBtn, navActions.firstChild);
        }

        // Add streak indicator
        this.updateStreakUI();
    },

    // Update streak UI
    updateStreakUI() {
        // Could add a streak indicator to the header
    },

    // Check and award achievements
    checkAchievements() {
        const unlockedAchievements = Utils.storage.get('appforge_achievements', []);
        let newUnlocks = [];

        this.achievements.forEach(achievement => {
            if (!unlockedAchievements.includes(achievement.id)) {
                if (achievement.condition(this.stats)) {
                    unlockedAchievements.push(achievement.id);
                    newUnlocks.push(achievement);
                }
            }
        });

        if (newUnlocks.length > 0) {
            Utils.storage.set('appforge_achievements', unlockedAchievements);
            
            // Show notifications for new achievements
            newUnlocks.forEach((achievement, index) => {
                setTimeout(() => {
                    this.showAchievementNotification(achievement);
                }, index * 1000);
            });
        }

        return newUnlocks;
    },

    // Show achievement notification
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon" style="background: ${achievement.color}">
                <i class="fas ${achievement.icon}"></i>
            </div>
            <div class="achievement-info">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    },

    // Show achievements modal
    showAchievementsModal() {
        const unlockedAchievements = Utils.storage.get('appforge_achievements', []);
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'achievementsModal';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2><i class="fas fa-trophy"></i> Achievements</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="achievements-content">
                    <div class="achievements-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(unlockedAchievements.length / this.achievements.length) * 100}%"></div>
                        </div>
                        <span>${unlockedAchievements.length} / ${this.achievements.length} unlocked</span>
                    </div>
                    <div class="achievements-grid">
                        ${this.achievements.map(ach => {
                            const isUnlocked = unlockedAchievements.includes(ach.id);
                            return `
                                <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                                    <div class="achievement-icon-large" style="background: ${isUnlocked ? ach.color : '#333'}">
                                        <i class="fas ${ach.icon}"></i>
                                    </div>
                                    <div class="achievement-details">
                                        <h4>${ach.name}</h4>
                                        <p>${ach.description}</p>
                                        ${!isUnlocked ? '<span class="locked-badge"><i class="fas fa-lock"></i> Locked</span>' : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },

    // Track event
    trackEvent(event, data = {}) {
        switch (event) {
            case 'app_created':
                this.stats.appsCreated++;
                this.stats.dailyApps++;
                this.checkNightBuild();
                break;
            case 'export':
                this.stats.exports++;
                break;
            case 'template_used':
                if (!this.stats.templatesUsed.includes(data.templateId)) {
                    this.stats.templatesUsed.push(data.templateId);
                }
                break;
            case 'voice_used':
                this.stats.voiceUsed = true;
                break;
            case 'image_used':
                this.stats.imageUsed = true;
                break;
            case 'debugger_used':
                this.stats.debuggerUsed = true;
                if (data.issuesFixed) {
                    this.stats.issuesFixed += data.issuesFixed;
                }
                break;
            case 'featured_in_gallery':
                this.stats.featuredInGallery = true;
                break;
        }

        this.saveStats();
        this.checkAchievements();
    },

    // Check if it's a night build
    checkNightBuild() {
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 5) {
            this.stats.nightBuild = true;
        }
    },

    // Get unlocked achievements
    getUnlockedAchievements() {
        return Utils.storage.get('appforge_achievements', []);
    },

    // Get achievement count
    getAchievementCount() {
        return this.getUnlockedAchievements().length;
    },

    // Get total achievements
    getTotalAchievements() {
        return this.achievements.length;
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    Gamification.init();
});

window.Gamification = Gamification;
