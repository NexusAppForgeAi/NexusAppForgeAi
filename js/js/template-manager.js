// Template Manager - Handles templates gallery and template system

const TemplateManager = {
    // Template definitions
    templates: [
        {
            id: 'restaurant',
            name: 'Restaurant',
            description: 'Full-featured restaurant website with menu, reservations, and online ordering',
            category: 'business',
            icon: 'fa-utensils',
            color: '#E74C3C',
            prompt: `Create a modern restaurant website with:
• Hero section with appetizing food imagery
• Interactive menu with categories and prices
• Online reservation system
• Location map and contact info
• Photo gallery of dishes
• Customer reviews section
• Online ordering for pickup/delivery
• Responsive design with warm, inviting colors`,
            tags: ['food', 'business', 'ecommerce']
        },
        {
            id: 'portfolio',
            name: 'Portfolio',
            description: 'Professional portfolio to showcase your work and skills',
            category: 'personal',
            icon: 'fa-briefcase',
            color: '#9B59B6',
            prompt: `Create a stunning personal portfolio website with:
• Eye-catching hero section with your name and tagline
• About me section with bio and photo
• Projects showcase with filtering
• Skills section with progress bars
• Work experience timeline
• Contact form with validation
• Social media links
• Smooth animations and transitions
• Dark theme option`,
            tags: ['personal', 'creative', 'professional']
        },
        {
            id: 'business',
            name: 'Business',
            description: 'Professional corporate website for any business',
            category: 'business',
            icon: 'fa-building',
            color: '#3498DB',
            prompt: `Create a professional business website with:
• Modern hero section with value proposition
• Services section with detailed descriptions
• About us with team members
• Client testimonials carousel
• Case studies or portfolio
• Contact form and map
• Call-to-action buttons
• Trust badges and certifications
• Professional blue/gray color scheme`,
            tags: ['business', 'corporate', 'professional']
        },
        {
            id: 'ecommerce',
            name: 'E-Commerce',
            description: 'Complete online store with product listings and cart',
            category: 'ecommerce',
            icon: 'fa-shopping-cart',
            color: '#27AE60',
            prompt: `Create a modern e-commerce website with:
• Product grid with filtering and sorting
• Product detail pages with images
• Shopping cart with quantity controls
• Checkout process with forms
• User account section
• Order tracking
• Product reviews and ratings
• Related products
• Secure payment interface
• Clean, conversion-focused design`,
            tags: ['ecommerce', 'shopping', 'business']
        },
        {
            id: 'taskmanager',
            name: 'Task Manager',
            description: 'Productivity app for managing tasks and projects',
            category: 'tools',
            icon: 'fa-tasks',
            color: '#F39C12',
            prompt: `Create a task management app with:
• Dashboard with task statistics
• Task list with categories and priorities
• Add/edit/delete task functionality
• Drag and drop task organization
• Due dates and reminders
• Progress tracking
• Filter by status/priority
• Dark/light theme toggle
• Local storage for data persistence`,
            tags: ['productivity', 'tools', 'app']
        },
        {
            id: 'notes',
            name: 'Notes App',
            description: 'Simple and elegant note-taking application',
            category: 'tools',
            icon: 'fa-sticky-note',
            color: '#1ABC9C',
            prompt: `Create a notes application with:
• Note list with search and filter
• Rich text editor for note content
• Create, edit, delete notes
• Organize with tags/folders
• Pin important notes
• Archive old notes
• Auto-save functionality
• Export notes as text/HTML
• Clean, distraction-free design`,
            tags: ['productivity', 'tools', 'notes']
        },
        {
            id: 'blog',
            name: 'Blog',
            description: 'Modern blog platform with articles and comments',
            category: 'personal',
            icon: 'fa-blog',
            color: '#E67E22',
            prompt: `Create a modern blog website with:
• Blog post grid with featured posts
• Individual article pages
• Categories and tags
• Author profiles
• Social sharing buttons
• Newsletter signup
• Related posts
• Comment system
• Reading time estimation
• Clean typography`,
            tags: ['blog', 'content', 'personal']
        },
        {
            id: 'dashboard',
            name: 'Dashboard',
            description: 'Analytics dashboard with charts and data visualization',
            category: 'tools',
            icon: 'fa-chart-line',
            color: '#34495E',
            prompt: `Create an analytics dashboard with:
• KPI cards with key metrics
• Interactive charts and graphs
• Data tables with sorting
• Date range selector
• Filter and search functionality
• Export data option
• Responsive grid layout
• Dark theme optimized
• Real-time data simulation`,
            tags: ['analytics', 'dashboard', 'business']
        },
        {
            id: 'landing',
            name: 'Landing Page',
            description: 'High-converting landing page for products or services',
            category: 'business',
            icon: 'fa-rocket',
            color: '#FF3366',
            prompt: `Create a high-converting landing page with:
• Attention-grabbing hero section
• Clear value proposition
• Feature highlights with icons
• Social proof (testimonials, logos)
• Pricing section
• FAQ accordion
• Strong call-to-action buttons
• Lead capture form
• Trust indicators
• Mobile-optimized design`,
            tags: ['marketing', 'landing', 'conversion']
        },
        {
            id: 'social',
            name: 'Social Feed',
            description: 'Social media style feed with posts and interactions',
            category: 'personal',
            icon: 'fa-users',
            color: '#1DA1F2',
            prompt: `Create a social media feed app with:
• Post feed with infinite scroll
• Create new post with media
• Like, comment, share functionality
• User profiles
• Follow/unfollow users
• Notifications
• Direct messages
• Trending topics
• Search functionality
• Responsive mobile design`,
            tags: ['social', 'community', 'app']
        }
    ],

    // Initialize
    init() {
        this.renderTemplates();
        this.setupFilters();
    },

    // Render templates grid
    renderTemplates(filter = 'all') {
        const grid = document.getElementById('templatesGrid');
        if (!grid) return;

        const filteredTemplates = filter === 'all' 
            ? this.templates 
            : this.templates.filter(t => t.category === filter);

        grid.innerHTML = filteredTemplates.map(template => `
            <div class="template-card" data-template="${template.id}">
                <div class="template-preview" style="background: linear-gradient(135deg, ${template.color}22, ${template.color}44)">
                    <i class="fas ${template.icon}" style="color: ${template.color}"></i>
                </div>
                <div class="template-info">
                    <h3>${template.name}</h3>
                    <p>${template.description}</p>
                    <div class="template-tags">
                        ${template.tags.map(tag => `<span class="template-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        grid.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const templateId = card.dataset.template;
                this.useTemplate(templateId);
            });
        });
    },

    // Setup filter buttons
    setupFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter templates
                const filter = btn.dataset.filter;
                this.renderTemplates(filter);
            });
        });
    },

    // Use a template
    useTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        // Set prompt in textarea
        const promptField = document.getElementById('appPrompt');
        if (promptField) {
            promptField.value = template.prompt;
        }

        // Switch to editor tab
        const editorTab = document.querySelector('.nav-tab[data-tab="editor"]');
        if (editorTab) {
            editorTab.click();
        }

        UIManager.toast(`Loaded ${template.name} template!`, 'success');
    },

    // Get template by ID
    getTemplate(templateId) {
        return this.templates.find(t => t.id === templateId);
    },

    // Get all templates
    getAllTemplates() {
        return [...this.templates];
    },

    // Get templates by category
    getTemplatesByCategory(category) {
        return this.templates.filter(t => t.category === category);
    },

    // Search templates
    searchTemplates(query) {
        const lowerQuery = query.toLowerCase();
        return this.templates.filter(t => 
            t.name.toLowerCase().includes(lowerQuery) ||
            t.description.toLowerCase().includes(lowerQuery) ||
            t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    },

    // Add custom template (for future use)
    addCustomTemplate(template) {
        const newTemplate = {
            ...template,
            id: `custom-${Utils.generateId()}`,
            isCustom: true
        };
        this.templates.push(newTemplate);
        return newTemplate;
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    TemplateManager.init();
});

window.TemplateManager = TemplateManager;
