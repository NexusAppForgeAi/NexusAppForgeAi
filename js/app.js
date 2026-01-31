// Add to initApp() function:
async function initApp() {
    console.log('Initializing AppForge...');
    
    try {
        // Initialize all modules
        initUIManager();
        initCodeEditor();
        initPreviewManager();
        initAIEngine();
        initAPKBuilder();
        initTemplateManager();
        
        // NEW: Initialize license and user management
        initLicenseManager();
        initUserManager();
        
        // Load saved state
        loadAppState();
        
        // Set up event listeners
        setupGlobalListeners();
        
        // Show welcome message
        setTimeout(() => {
            showToast('Welcome to AppForge AI! 🚀', 'info');
            console.log('AppForge initialized successfully.');
        }, 1000);
        
    } catch (error) {
        console.error('Failed to initialize AppForge:', error);
        showToast('Failed to initialize application. Please refresh.', 'error');
    }
}