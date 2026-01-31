// Community Gallery - Share and discover apps

const CommunityGallery = {
    // Gallery data
    apps: [],

    // Initialize
    init() {
        this.loadApps();
        this.setupUI();
    },

    // Load apps from storage
    loadApps() {
        // In production, this would come from your backend
        const saved = Utils.storage.get('appforge_community_apps');
        if (saved) {
            this.apps = saved;
        } else {
            // Add sample apps
            this.apps = this.getSampleApps();
        }
    },

    // Save apps
    saveApps() {
        Utils.storage.set('appforge_community_apps', this.apps);
    },

    // Get sample apps
    getSampleApps() {
        return [
            {
                id: 'app-001',
                name: 'TaskMaster Pro',
                description: 'A powerful task management app with drag-and-drop, categories, and reminders.',
                author: 'Alex Chen',
                authorId: 'user-001',
                preview: 'https://via.placeholder.com/400x300/3366FF/FFFFFF?text=TaskMaster',
                code: '<!DOCTYPE html><html><head><title>TaskMaster</title></head><body><h1>TaskMaster Pro</h1></body></html>',
                views: 2456,
                likes: 189,
                downloads: 456,
                featured: true,
                tags: ['productivity', 'tasks', 'management'],
                createdAt: Date.now() - 86400000 * 5,
                tier: 'pro'
            },
            {
                id: 'app-002',
                name: 'Foodie Finder',
                description: 'Discover restaurants, read reviews, and find the best food near you.',
                author: 'Maria Garcia',
                authorId: 'user-002',
                preview: 'https://via.placeholder.com/400x300/E74C3C/FFFFFF?text=Foodie',
                code: '<!DOCTYPE html><html><head><title>Foodie</title></head><body><h1>Foodie Finder</h1></body></html>',
                views: 1823,
                likes: 134,
                downloads: 289,
                featured: true,
                tags: ['food', 'restaurants', 'reviews'],
                createdAt: Date.now() - 86400000 * 3,
                tier: 'free'
            },
            {
                id: 'app-003',
                name: 'FitTrack Dashboard',
                description: 'Track your fitness goals with beautiful charts and progress tracking.',
                author: 'Tom Wilson',
                authorId: 'user-003',
                preview: 'https://via.placeholder.com/400x300/27AE60/FFFFFF?text=FitTrack',
                code: '<!DOCTYPE html><html><head><title>FitTrack</title></head><body><h1>FitTrack</h1></body></html>',
                views: 987,
                likes: 67,
                downloads: 123,
                featured: false,
                tags: ['fitness', 'health', 'dashboard'],
                createdAt: Date.now() - 86400000 * 7,
                tier: 'free'
            },
            {
                id: 'app-004',
                name: 'CryptoWatch',
                description: 'Real-time cryptocurrency tracker with price alerts and portfolio management.',
                author: 'Lisa Park',
                authorId: 'user-004',
                preview: 'https://via.placeholder.com/400x300/F39C12/FFFFFF?text=CryptoWatch',
                code: '<!DOCTYPE html><html><head><title>CryptoWatch</title></head><body><h1>CryptoWatch</h1></body></html>',
                views: 3421,
                likes: 267,
                downloads: 678,
                featured: true,
                tags: ['crypto', 'finance', 'tracking'],
                createdAt: Date.now() - 86400000 * 2,
                tier: 'pro'
            },
            {
                id: 'app-005',
                name: 'Travel Journal',
                description: 'Document your travels with photos, maps, and stories.',
                author: 'James Miller',
                authorId: 'user-005',
                preview: 'https://via.placeholder.com/400x300/9B59B6/FFFFFF?text=Travel',
                code: '<!DOCTYPE html><html><head><title>Travel</title></head><body><h1>Travel Journal</h1></body></html>',
                views: 654,
                likes: 45,
                downloads: 89,
                featured: false,
                tags: ['travel', 'journal', 'photos'],
                createdAt: Date.now() - 86400000 * 10,
                tier: 'free'
            },
            {
                id: 'app-006',
                name: 'Music Streamer',
                description: 'Beautiful music player with playlist management and visualizations.',
                author: 'Emma Davis',
                authorId: 'user-006',
                preview: 'https://via.placeholder.com/400x300/1ABC9C/FFFFFF?text=Music',
                code: '<!DOCTYPE html><html><head><title>Music</title></head><body><h1>Music Streamer</h1></body></html>',
                views: 1567,
                likes: 123,
                downloads: 234,
                featured: false,
                tags: ['music', 'player', 'audio'],
                createdAt: Date.now() - 86400000 * 4,
                tier: 'free'
            }
        ];
    },

    // Setup UI
    setupUI() {
        // Add gallery tab to navigation
        const navTabs = document.querySelector('.nav-tabs');
        if (navTabs) {
            const galleryTab = document.createElement('button');
            galleryTab.className = 'nav-tab';
            galleryTab.dataset.tab = 'gallery';
            galleryTab.innerHTML = '<i class="fas fa-globe"></i> Community';
            navTabs.insertBefore(galleryTab, navTabs.children[1]);

            // Add gallery section
            this.createGallerySection();
        }
    },

    // Create gallery section
    createGallerySection() {
        const mainContainer = document.querySelector('.main-container');
        if (!mainContainer) return;

        const gallerySection = document.createElement('section');
        gallerySection.id = 'galleryTab';
        gallerySection.className = 'tab-content';
        gallerySection.innerHTML = `
            <div class="gallery-header">
                <h2><i class="fas fa-globe"></i> Community Gallery</h2>
                <p>Discover amazing apps built by the community. Get inspired and remix!</p>
            </div>
            
            <div class="gallery-filters">
                <button class="filter-btn active" data-filter="all">All</button>
                <button class="filter-btn" data-filter="featured">Featured</button>
                <button class="filter-btn" data-filter="popular">Popular</button>
                <button class="filter-btn" data-filter="recent">Recent</button>
                <button class="filter-btn" data-filter="my-apps">My Apps</button>
            </div>
            
            <div class="gallery-search">
                <input type="text" id="gallerySearch" placeholder="Search apps...">
                <i class="fas fa-search"></i>
            </div>
            
            <div class="community-gallery-grid" id="communityGalleryGrid">
                <!-- Populated by JS -->
            </div>
            
            <div class="gallery-cta">
                <h3>Want to share your app?</h3>
                <p>Submit your creation to the community gallery and get featured!</p>
                <button class="btn-primary" id="submitAppBtn">
                    <i class="fas fa-upload"></i> Submit Your App
                </button>
            </div>
        `;

        mainContainer.appendChild(gallerySection);

        // Setup event listeners
        this.setupGalleryEvents();

        // Render gallery
        this.renderGallery();
    },

    // Setup gallery events
    setupGalleryEvents() {
        // Filter buttons
        document.querySelectorAll('.gallery-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.gallery-filters .filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderGallery(e.target.dataset.filter);
            });
        });

        // Search
        const searchInput = document.getElementById('gallerySearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.renderGallery('all', searchInput.value);
            }, 300));
        }

        // Submit button
        const submitBtn = document.getElementById('submitAppBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.showSubmitModal());
        }
    },

    // Render gallery
    renderGallery(filter = 'all', search = '') {
        const grid = document.getElementById('communityGalleryGrid');
        if (!grid) return;

        let filteredApps = [...this.apps];

        // Apply filter
        switch (filter) {
            case 'featured':
                filteredApps = filteredApps.filter(app => app.featured);
                break;
            case 'popular':
                filteredApps = filteredApps.sort((a, b) => b.likes - a.likes);
                break;
            case 'recent':
                filteredApps = filteredApps.sort((a, b) => b.createdAt - a.createdAt);
                break;
            case 'my-apps':
                // In production, filter by current user
                filteredApps = filteredApps.filter(app => app.authorId === 'current-user');
                break;
        }

        // Apply search
        if (search) {
            const lowerSearch = search.toLowerCase();
            filteredApps = filteredApps.filter(app => 
                app.name.toLowerCase().includes(lowerSearch) ||
                app.description.toLowerCase().includes(lowerSearch) ||
                app.tags.some(tag => tag.toLowerCase().includes(lowerSearch))
            );
        }

        grid.innerHTML = filteredApps.map(app => `
            <div class="community-app-card" data-id="${app.id}">
                <div class="app-preview">
                    <img src="${app.preview}" alt="${app.name}">
                    ${app.featured ? '<span class="featured-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
                    ${app.tier === 'pro' ? '<span class="pro-badge">PRO</span>' : ''}
                </div>
                <div class="app-info">
                    <h4>${app.name}</h4>
                    <p>${app.description}</p>
                    <div class="app-tags">
                        ${app.tags.map(tag => `<span class="app-tag">${tag}</span>`).join('')}
                    </div>
                    <div class="app-meta">
                        <div class="app-author">
                            <i class="fas fa-user-circle"></i>
                            ${app.author}
                        </div>
                        <div class="app-stats">
                            <span><i class="fas fa-eye"></i> ${this.formatNumber(app.views)}</span>
                            <span><i class="fas fa-heart"></i> ${this.formatNumber(app.likes)}</span>
                            <span><i class="fas fa-download"></i> ${this.formatNumber(app.downloads)}</span>
                        </div>
                    </div>
                    <div class="app-actions">
                        <button class="btn-preview" onclick="CommunityGallery.previewApp('${app.id}')">
                            <i class="fas fa-eye"></i> Preview
                        </button>
                        <button class="btn-remix" onclick="CommunityGallery.remixApp('${app.id}')">
                            <i class="fas fa-code-branch"></i> Remix
                        </button>
                        <button class="btn-like" onclick="CommunityGallery.likeApp('${app.id}')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Format number
    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    },

    // Preview app
    previewApp(appId) {
        const app = this.apps.find(a => a.id === appId);
        if (!app) return;

        // Increment views
        app.views++;
        this.saveApps();

        // Show preview modal
        const modal = document.createElement('div');
        modal.className = 'modal active preview-modal';
        modal.innerHTML = `
            <div class="modal-content modal-xlarge">
                <div class="modal-header">
                    <h2>${app.name}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="preview-container">
                    <iframe srcdoc="${app.code.replace(/"/g, '&quot;')}"></iframe>
                </div>
                <div class="preview-actions">
                    <button class="btn-primary" onclick="CommunityGallery.remixApp('${app.id}')">
                        <i class="fas fa-code-branch"></i> Remix This App
                    </button>
                    <button class="btn-secondary" onclick="CommunityGallery.downloadApp('${app.id}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    // Remix app
    remixApp(appId) {
        const app = this.apps.find(a => a.id === appId);
        if (!app) return;

        // Load code into editor
        CodeEditor.setCode(app.code);

        // Add attribution comment
        const promptField = document.getElementById('appPrompt');
        if (promptField) {
            promptField.value = `Remix of "${app.name}" by ${app.author}. Make it better!`;
        }

        // Switch to editor tab
        document.querySelector('.nav-tab[data-tab="editor"]')?.click();

        UIManager.toast(`Remixing "${app.name}" - make it your own!`, 'success');
    },

    // Like app
    likeApp(appId) {
        const app = this.apps.find(a => a.id === appId);
        if (!app) return;

        app.likes++;
        this.saveApps();
        this.renderGallery();

        UIManager.toast('App liked!', 'success');
    },

    // Download app
    downloadApp(appId) {
        const app = this.apps.find(a => a.id === appId);
        if (!app) return;

        app.downloads++;
        this.saveApps();

        Utils.downloadFile(app.code, `${app.name.replace(/\s+/g, '_').toLowerCase()}.html`, 'text/html');

        UIManager.toast('App downloaded!', 'success');
    },

    // Show submit modal
    showSubmitModal() {
        const code = CodeEditor.getCode();
        if (!code.trim()) {
            UIManager.toast('Create an app first before submitting!', 'error');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-upload"></i> Submit to Gallery</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="submit-form">
                    <div class="form-group">
                        <label>App Name</label>
                        <input type="text" id="submitAppName" placeholder="My Awesome App">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="submitAppDesc" placeholder="Describe your app..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Tags (comma separated)</label>
                        <input type="text" id="submitAppTags" placeholder="productivity, tools, app">
                    </div>
                    <button class="btn-primary" onclick="CommunityGallery.submitApp()">
                        <i class="fas fa-paper-plane"></i> Submit App
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    // Submit app
    submitApp() {
        const name = document.getElementById('submitAppName')?.value;
        const description = document.getElementById('submitAppDesc')?.value;
        const tags = document.getElementById('submitAppTags')?.value.split(',').map(t => t.trim()).filter(t => t);

        if (!name || !description) {
            UIManager.toast('Please fill in all fields', 'error');
            return;
        }

        const code = CodeEditor.getCode();
        const userState = UserManager.getState();

        const newApp = {
            id: 'app-' + Date.now(),
            name,
            description,
            author: userState.name || 'Anonymous',
            authorId: 'current-user',
            preview: 'https://via.placeholder.com/400x300/3366FF/FFFFFF?text=' + encodeURIComponent(name),
            code,
            views: 0,
            likes: 0,
            downloads: 0,
            featured: false,
            tags,
            createdAt: Date.now(),
            tier: userState.tier
        };

        this.apps.unshift(newApp);
        this.saveApps();

        // Track achievement
        Gamification.trackEvent('featured_in_gallery');

        // Close modal
        document.querySelector('.modal.active')?.remove();

        UIManager.toast('App submitted! Pending review.', 'success');

        // Switch to gallery and show
        document.querySelector('.nav-tab[data-tab="gallery"]')?.click();
        this.renderGallery();
    },

    // Add app to gallery (admin function)
    addApp(app) {
        this.apps.push(app);
        this.saveApps();
    },

    // Feature app (admin function)
    featureApp(appId) {
        const app = this.apps.find(a => a.id === appId);
        if (app) {
            app.featured = true;
            this.saveApps();
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    CommunityGallery.init();
});

window.CommunityGallery = CommunityGallery;
