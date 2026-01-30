// ===== TEMPLATE MANAGER =====
// Handles template loading and management

class TemplateManager {
    constructor() {
        this.templates = [];
        this.currentCategory = 'all';
        this.favorites = new Set();
        
        this.init();
    }
    
    async init() {
        await this.loadTemplates();
        this.renderTemplates();
        this.setupEventListeners();
        
        console.log('Template Manager initialized');
    }
    
    async loadTemplates() {
        // In a real implementation, load from API or local storage
        // For now, use hardcoded templates
        this.templates = this.getDefaultTemplates();
        
        // Load favorites from storage
        const savedFavorites = StorageManager.get('template-favorites', []);
        this.favorites = new Set(savedFavorites);
    }
    
    getDefaultTemplates() {
        return [
            {
                id: 'task-manager',
                name: 'Task Manager',
                category: 'productivity',
                description: 'Modern task management app with drag & drop',
                icon: 'fas fa-tasks',
                color: '#4361ee',
                tags: ['mobile', 'productivity', 'offline']
            },
            {
                id: 'notes-app',
                name: 'Notes App',
                category: 'productivity',
                description: 'Beautiful notes app with rich text editing',
                icon: 'fas fa-sticky-note',
                color: '#7209b7',
                tags: ['mobile', 'notes', 'editor']
            },
            {
                id: 'fitness-tracker',
                name: 'Fitness Tracker',
                category: 'health',
                description: 'Workout and health tracking application',
                icon: 'fas fa-running',
                color: '#4cc9f0',
                tags: ['fitness', 'health', 'charts']
            },
            {
                id: 'ecommerce-store',
                name: 'E-commerce Store',
                category: 'business',
                description: 'Complete online store with cart and checkout',
                icon: 'fas fa-shopping-cart',
                color: '#f8961e',
                tags: ['ecommerce', 'shopping', 'payments']
            },
            {
                id: 'social-network',
                name: 'Social Network',
                category: 'social',
                description: 'Social media app with profiles and feeds',
                icon: 'fas fa-users',
                color: '#f72585',
                tags: ['social', 'profiles', 'feed']
            },
            {
                id: 'recipe-book',
                name: 'Recipe Book',
                category: 'lifestyle',
                description: 'Digital cookbook with ingredient tracking',
                icon: 'fas fa-utensils',
                color: '#2ecc71',
                tags: ['food', 'recipes', 'cooking']
            },
            {
                id: 'expense-tracker',
                name: 'Expense Tracker',
                category: 'finance',
                description: 'Budget and expense management app',
                icon: 'fas fa-chart-pie',
                color: '#e63946',
                tags: ['finance', 'budget', 'charts']
            },
            {
                id: 'weather-app',
                name: 'Weather App',
                category: 'utility',
                description: 'Beautiful weather forecast application',
                icon: 'fas fa-cloud-sun',
                color: '#4895ef',
                tags: ['weather', 'forecast', 'location']
            }
        ];
    }
    
    renderTemplates() {
        const templatesGrid = document.querySelector('.templates-grid');
        if (!templatesGrid) return;
        
        // Filter templates by category
        const filteredTemplates = this.currentCategory === 'all' 
            ? this.templates 
            : this.templates.filter(t => t.category === this.currentCategory);
        
        // Create template cards
        templatesGrid.innerHTML = filteredTemplates.map(template => `
            <div class="template-card" data-id="${template.id}">
                <div class="template-header">
                    <div class="template-icon" style="background-color: ${template.color}">
                        <i class="${template.icon}"></i>
                    </div>
                    <button class="template-favorite ${this.favorites.has(template.id) ? 'active' : ''}" 
                            data-id="${template.id}" title="Add to favorites">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
                <div class="template-content">
                    <h3>${template.name}</h3>
                    <p>${template.description}</p>
                    <div class="template-tags">
                        ${template.tags.map(tag => `<span class="template-tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="template-actions">
                    <button class="btn btn-sm btn-outline template-preview" data-id="${template.id}">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                    <button class="btn btn-sm btn-primary template-use" data-id="${template.id}">
                        <i class="fas fa-magic"></i> Use Template
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add CSS for templates if not already added
        this.addTemplateStyles();
    }
    
    addTemplateStyles() {
        if (document.getElementById('template-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'template-styles';
        style.textContent = `
            .templates-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 20px;
                margin-bottom: 24px;
            }
            
            .template-card {
                background: var(--light);
                border: 1px solid var(--gray-200);
                border-radius: var(--radius-lg);
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            .template-card:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-lg);
                border-color: var(--primary);
            }
            
            .template-header {
                display: flex;
                justify-content: space-between;
                align-items: start;
                padding: 20px 20px 0;
            }
            
            .template-icon {
                width: 60px;
                height: 60px;
                border-radius: var(--radius-lg);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
            }
            
            .template-favorite {
                background: none;
                border: none;
                color: var(--gray-400);
                font-size: 20px;
                cursor: pointer;
                transition: color 0.2s;
            }
            
            .template-favorite:hover {
                color: var(--warning);
            }
            
            .template-favorite.active {
                color: var(--warning);
            }
            
            .template-content {
                padding: 20px;
            }
            
            .template-content h3 {
                margin: 0 0 8px;
                font-size: 1.25rem;
            }
            
            .template-content p {
                margin: 0 0 12px;
                color: var(--gray-600);
                font-size: 0.875rem;
                line-height: 1.5;
            }
            
            .template-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
            
            .template-tag {
                background: var(--gray-100);
                color: var(--gray-700);
                padding: 4px 8px;
                border-radius: var(--radius-full);
                font-size: 0.75rem;
                font-weight: 500;
            }
            
            .template-actions {
                padding: 0 20px 20px;
                display: flex;
                gap: 10px;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    setupEventListeners() {
        // Load more templates button
        const loadMoreBtn = document.getElementById('loadMoreTemplatesBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreTemplates());
        }
        
        // Delegate template actions
        document.addEventListener('click', (e) => {
            const templateCard = e.target.closest('.template-card');
            if (!templateCard) return;
            
            const templateId = templateCard.getAttribute('data-id');
            const template = this.templates.find(t => t.id === templateId);
            if (!template) return;
            
            // Handle favorite toggle
            if (e.target.closest('.template-favorite')) {
                e.preventDefault();
                this.toggleFavorite(templateId);
                return;
            }
            
            // Handle preview
            if (e.target.closest('.template-preview')) {
                e.preventDefault();
                this.previewTemplate(template);
                return;
            }
            
            // Handle use template
            if (e.target.closest('.template-use')) {
                e.preventDefault();
                this.useTemplate(template);
                return;
            }
        });
    }
    
    toggleFavorite(templateId) {
        if (this.favorites.has(templateId)) {
            this.favorites.delete(templateId);
        } else {
            this.favorites.add(templateId);
        }
        
        // Save favorites
        StorageManager.set('template-favorites', Array.from(this.favorites));
        
        // Update UI
        const favoriteBtn = document.querySelector(`.template-favorite[data-id="${templateId}"]`);
        if (favoriteBtn) {
            favoriteBtn.classList.toggle('active', this.favorites.has(templateId));
        }
        
        showToast(
            this.favorites.has(templateId) 
                ? 'Added to favorites' 
                : 'Removed from favorites', 
            'info'
        );
    }
    
    async previewTemplate(template) {
        // Load template preview
        showToast(`Loading ${template.name} preview...`, 'info');
        
        // In a real implementation, load template content
        // For now, show a message
        setTimeout(() => {
            alert(`Preview of ${template.name}\n\nThis would show a live preview of the template.`);
        }, 500);
    }
    
    async useTemplate(template) {
        showToast(`Loading ${template.name} template...`, 'info');
        
        try {
            // Load template code
            const templateCode = await this.loadTemplateCode(template.id);
            
            // Update editor with template code
            if (window.setEditorContent) {
                window.setEditorContent(templateCode);
            }
            
            // Update preview
            if (window.setPreviewContent) {
                window.setPreviewContent(templateCode);
            }
            
            // Switch to editor tab
            document.querySelector('.tab-btn[data-tab="manual"]')?.click();
            
            showToast(`${template.name} template loaded!`, 'success');
            
        } catch (error) {
            console.error('Failed to load template:', error);
            showToast('Failed to load template. Using fallback.', 'error');
            
            // Use fallback template
            this.useFallbackTemplate(template);
        }
    }
    
    async loadTemplateCode(templateId) {
        // In a real implementation, fetch template from API or local storage
        // For now, generate based on template ID
        
        return this.generateTemplateCode(templateId);
    }
    
    generateTemplateCode(templateId) {
        // Generate sample code based on template
        const templates = {
            'task-manager': `<!DOCTYPE html>
<html>
<head>
    <title>Task Manager</title>
    <style>
        /* Task Manager Styles */
        body { font-family: Arial, sans-serif; }
        .task { padding: 10px; border-bottom: 1px solid #ddd; }
        .completed { text-decoration: line-through; }
    </style>
</head>
<body>
    <h1>Task Manager</h1>
    <input type="text" id="newTask" placeholder="Add new task...">
    <button onclick="addTask()">Add</button>
    <div id="tasks"></div>
    <script>
        function addTask() {
            // Task manager functionality
        }
    </script>
</body>
</html>`,
            
            'notes-app': `<!DOCTYPE html>
<html>
<head>
    <title>Notes App</title>
    <style>
        /* Notes App Styles */
        .note { margin: 10px; padding: 15px; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <h1>Notes App</h1>
    <textarea id="noteInput"></textarea>
    <button onclick="saveNote()">Save Note</button>
    <div id="notes"></div>
    <script>
        function saveNote() {
            // Notes functionality
        }
    </script>
</body>
</html>`
        };
        
        return templates[templateId] || `<!DOCTYPE html>
<html>
<head>
    <title>${templateId} App</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
    </style>
</head>
<body>
    <h1>${templateId} App</h1>
    <p>Template loaded successfully!</p>
</body>
</html>`;
    }
    
    useFallbackTemplate(template) {
        const fallbackCode = `<!DOCTYPE html>
<html>
<head>
    <title>${template.name}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 {
            color: #4361ee;
            margin-bottom: 20px;
        }
        .btn {
            background: #4361ee;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${template.name}</h1>
        <p>${template.description}</p>
        <button class="btn" onclick="alert('Hello from ${template.name}!')">
            Get Started
        </button>
    </div>
</body>
</html>`;
        
        if (window.setEditorContent) {
            window.setEditorContent(fallbackCode);
        }
        
        if (window.setPreviewContent) {
            window.setPreviewContent(fallbackCode);
        }
    }
    
    async loadMoreTemplates() {
        showToast('Loading more templates...', 'info');
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Add more templates (in a real app, fetch from API)
        const moreTemplates = [
            {
                id: 'habit-tracker',
                name: 'Habit Tracker',
                category: 'productivity',
                description: 'Build and track daily habits',
                icon: 'fas fa-calendar-check',
                color: '#2ecc71',
                tags: ['habits', 'tracking', 'goals']
            },
            {
                id: 'budget-planner',
                name: 'Budget Planner',
                category: 'finance',
                description: 'Personal finance and budget planning',
                icon: 'fas fa-wallet',
                color: '#27ae60',
                tags: ['budget', 'finance', 'planning']
            }
        ];
        
        this.templates.push(...moreTemplates);
        this.renderTemplates();
        
        showToast('More templates loaded!', 'success');
    }
    
    filterByCategory(category) {
        this.currentCategory = category;
        this.renderTemplates();
    }
    
    searchTemplates(query) {
        // Filter templates by search query
        const filtered = this.templates.filter(template => 
            template.name.toLowerCase().includes(query.toLowerCase()) ||
            template.description.toLowerCase().includes(query.toLowerCase()) ||
            template.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        
        return filtered;
    }
}

// Initialize Template Manager
let templateManager = null;

function initTemplateManager() {
    templateManager = new TemplateManager();
    console.log('Template Manager initialized');
}

// Export
window.initTemplateManager = initTemplateManager;
window.templateManager = templateManager;