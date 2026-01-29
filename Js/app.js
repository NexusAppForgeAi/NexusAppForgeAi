// AppForge - Main JavaScript with Enhanced AI System Prompt
console.log('🚀 AppForge loaded successfully!');

// ======================
// GLOBAL VARIABLES
// ======================
let currentAppCode = '';
let apiKey = '';
let isUsingAPIKey = false;
let connectionStatus = 'checking';

// Enhanced AI System Prompt
const AI_SYSTEM_PROMPT = `You are AppForge AI, an expert full-stack web developer with 15+ years of experience building production-ready applications. Follow these rules precisely:

# CRITICAL REQUIREMENTS:
1. Generate COMPLETE, FUNCTIONAL HTML/CSS/JS in a SINGLE FILE
2. Code must be PRODUCTION-READY - no placeholders or "TODO" comments
3. MUST include ALL features requested by the user
4. MUST be FULLY RESPONSIVE (mobile-first design)
5. MUST include proper error handling and user feedback
6. Use MODERN, CLEAN code with semantic HTML5
7. Include helpful comments for key sections

# DESIGN REQUIREMENTS:
- Use modern CSS (Flexbox/Grid, CSS variables for theming)
- Professional color schemes that match the app's purpose
- Smooth animations and transitions (use CSS transitions)
- Accessible (ARIA labels, keyboard navigation, proper contrast)
- Cross-browser compatible (Chrome, Firefox, Safari, Edge)

# TECHNICAL REQUIREMENTS:
- Self-contained vanilla JS (no external libraries unless absolutely necessary)
- Include form validation if forms exist
- Include interactive elements (buttons, modals, carousels, etc.)
- Ensure performance (optimized structure, avoid layout thrashing)
- Add meta tags for SEO when relevant
- Include viewport meta tag for responsiveness

# CODE QUALITY:
- Use meaningful class names and IDs (BEM methodology)
- Organize CSS logically (reset, variables, base, components, utilities)
- Use event delegation for dynamic elements
- Include proper error boundaries and loading states
- Add hover/focus states for all interactive elements

# OUTPUT FORMAT:
Return ONLY the complete HTML file with embedded CSS and JavaScript.
The file should be ready to run immediately when saved as .html

Example structure:
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Appropriate Title]</title>
    <style>
        /* Complete CSS with variables, reset, and responsive design */
    </style>
</head>
<body>
    <!-- Complete HTML structure -->
    <script>
        /* Complete JavaScript with IIFE for scope protection */
    </script>
</body>
</html>

IMPORTANT: Do not include explanations, markdown, or code fences. Only return the HTML file content.`;

// ======================
// INITIALIZATION
// ======================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initializing AppForge...');
    
    // Load saved API key
    loadSavedSettings();
    
    // Initialize Puter.js connection
    initPuterConnection();
    
    // Load demo app by default
    setTimeout(() => {
        useDemoMode();
    }, 800);
    
    // Set up event listeners
    setupEventListeners();
    
    console.log('✅ AppForge initialized successfully!');
});

// ======================
// PUTER.JS INTEGRATION
// ======================
async function initPuterConnection() {
    try {
        // Test Puter.js connection
        const testResponse = await puter.ai.chat.completions.create({
            messages: [{role: 'user', content: 'test'}],
            model: 'grok-2-latest',
            max_tokens: 5
        });
        
        if (apiKey) {
            connectionStatus = 'connected';
            updateConnectionStatus('🟢 Connected to Puter.js + Grok AI');
            console.log('✅ Puter.js connected with API key');
        } else {
            connectionStatus = 'free';
            updateConnectionStatus('🟡 Free Mode - Add API Key for AI');
            console.log('ℹ️ Puter.js in free mode (401 expected)');
        }
    } catch (error) {
        if (error.status === 401) {
            connectionStatus = 'free';
            updateConnectionStatus('🟡 Free Mode - Add API Key for AI');
            console.log('ℹ️ Puter.js free tier active (401 Unauthorized)');
        } else if (error.status === 429) {
            connectionStatus = 'rate-limited';
            updateConnectionStatus('🟡 Rate Limited - Try again later');
            showMessage('Rate limited. Try again in a few moments.', 'warning');
        } else {
            connectionStatus = 'error';
            updateConnectionStatus('🔴 Connection Error');
            console.error('❌ Puter.js connection failed:', error);
        }
    }
}

// ======================
// AI APP GENERATION
// ======================
async function generateApp() {
    const prompt = document.getElementById('appPrompt').value.trim();
    
    if (!prompt) {
        showMessage('Please describe what you want to build', 'warning');
        return;
    }
    
    // Show loading overlay
    showLoading('Analyzing your request...');
    
    try {
        if (apiKey && isUsingAPIKey) {
            // Use Grok AI with API key
            updateStatusMessage('🤖 Generating app with Grok AI...');
            
            const response = await puter.ai.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: AI_SYSTEM_PROMPT
                    },
                    {
                        role: 'user',
                        content: `Create a complete web application with the following requirements: ${prompt}\n\nMake it production-ready, responsive, and include all necessary functionality.`
                    }
                ],
                model: 'grok-2-latest',
                max_tokens: 4000,
                temperature: 0.7
            });
            
            const generatedCode = extractCodeFromResponse(response.choices[0].message.content);
            displayGeneratedApp(generatedCode);
            
            showMessage('✅ App generated successfully with AI!', 'success');
            console.log('🤖 AI-generated app created');
            
        } else {
            // Fallback to demo mode
            updateStatusMessage('🎨 Creating demo app...');
            
            // Simulate API delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1200));
            
            const demoCode = generateEnhancedDemoApp(prompt);
            displayGeneratedApp(demoCode);
            
            showMessage('🎨 Demo app created! Add API key for AI features.', 'warning');
            console.log('🎨 Demo app generated (free tier)');
        }
    } catch (error) {
        console.error('❌ Generation error:', error);
        
        // Fallback to demo mode on error
        const demoCode = generateEnhancedDemoApp(prompt);
        displayGeneratedApp(demoCode);
        
        if (error.status === 401) {
            showMessage('Using demo mode (401 Unauthorized). Add API key for AI generation.', 'warning');
        } else if (error.status === 429) {
            showMessage('Rate limited. Using demo mode. Try again later.', 'error');
        } else {
            showMessage('AI generation failed. Using enhanced demo mode.', 'error');
        }
    } finally {
        hideLoading();
    }
}

// ======================
// DEMO APP GENERATION
// ======================
function generateEnhancedDemoApp(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Determine app type from prompt
    let appType = 'restaurant'; // Default
    if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('resume')) {
        appType = 'portfolio';
    } else if (lowerPrompt.includes('business') || lowerPrompt.includes('corporate')) {
        appType = 'business';
    } else if (lowerPrompt.includes('shop') || lowerPrompt.includes('store') || lowerPrompt.includes('ecommerce')) {
        appType = 'ecommerce';
    } else if (lowerPrompt.includes('blog') || lowerPrompt.includes('news')) {
        appType = 'blog';
    } else if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('admin')) {
        appType = 'dashboard';
    }
    
    // Return appropriate enhanced demo template
    return getEnhancedDemoTemplate(appType, prompt);
}

function getEnhancedDemoTemplate(type, prompt) {
    const templates = {
        restaurant: generateRestaurantDemo(prompt),
        portfolio: generatePortfolioDemo(prompt),
        business: generateBusinessDemo(prompt),
        ecommerce: generateEcommerceDemo(prompt),
        blog: generateBlogDemo(prompt),
        dashboard: generateDashboardDemo(prompt)
    };
    
    return templates[type] || generateRestaurantDemo(prompt);
}

// Enhanced demo template generators
function generateRestaurantDemo(prompt) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gourmet Restaurant | Fine Dining</title>
    <style>
        :root {
            --primary: #e63946;
            --primary-dark: #c1121f;
            --secondary: #2a9d8f;
            --dark: #264653;
            --light: #f1faee;
            --gold: #e9c46a;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: var(--light);
            color: var(--dark);
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* Header & Navigation */
        header {
            background: var(--dark);
            color: white;
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--gold);
        }
        
        .nav-links {
            display: flex;
            gap: 2rem;
        }
        
        .nav-links a {
            color: white;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
        }
        
        .nav-links a:hover {
            color: var(--gold);
        }
        
        /* Hero Section */
        .hero {
            background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), 
                        url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80');
            background-size: cover;
            background-position: center;
            color: white;
            padding: 6rem 0;
            text-align: center;
        }
        
        .hero h1 {
            font-size: 3.5rem;
            margin-bottom: 1rem;
        }
        
        .hero p {
            font-size: 1.2rem;
            max-width: 600px;
            margin: 0 auto 2rem;
        }
        
        .btn {
            display: inline-block;
            background: var(--primary);
            color: white;
            padding: 12px 30px;
            border-radius: 30px;
            text-decoration: none;
            font-weight: 600;
            transition: background 0.3s, transform 0.3s;
        }
        
        .btn:hover {
            background: var(--primary-dark);
            transform: translateY(-2px);
        }
        
        /* Menu Section */
        .menu-section {
            padding: 5rem 0;
        }
        
        .section-title {
            text-align: center;
            margin-bottom: 3rem;
        }
        
        .section-title h2 {
            font-size: 2.5rem;
            color: var(--dark);
            margin-bottom: 1rem;
        }
        
        .menu-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        
        .menu-item {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        
        .menu-item:hover {
            transform: translateY(-10px);
        }
        
        .menu-item img {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        
        .menu-item-content {
            padding: 1.5rem;
        }
        
        .menu-item h3 {
            color: var(--dark);
            margin-bottom: 0.5rem;
        }
        
        .price {
            color: var(--primary);
            font-size: 1.2rem;
            font-weight: 700;
            margin: 1rem 0;
        }
        
        /* Reservation Form */
        .reservation {
            background: var(--dark);
            color: white;
            padding: 5rem 0;
        }
        
        .reservation-form {
            max-width: 600px;
            margin: 0 auto;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
        }
        
        /* Footer */
        footer {
            background: #1a1a2e;
            color: white;
            padding: 3rem 0;
            text-align: center;
        }
        
        .footer-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .copyright {
            padding-top: 2rem;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .nav-links {
                display: none;
            }
            
            .hero h1 {
                font-size: 2.5rem;
            }
            
            .menu-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header>
        <div class="container">
            <nav>
                <div class="logo">🍽️ Gourmet</div>
                <div class="nav-links">
                    <a href="#home">Home</a>
                    <a href="#menu">Menu</a>
                    <a href="#about">About</a>
                    <a href="#reservation">Reservations</a>
                    <a href="#contact">Contact</a>
                </div>
            </nav>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero" id="home">
        <div class="container">
            <h1>Experience Culinary Excellence</h1>
            <p>Fresh ingredients, masterful techniques, and unforgettable dining experiences since 1998.</p>
            <a href="#reservation" class="btn">Book a Table</a>
        </div>
    </section>

    <!-- Menu Section -->
    <section class="menu-section" id="menu">
        <div class="container">
            <div class="section-title">
                <h2>Our Signature Dishes</h2>
                <p>Chef's special creations made with passion</p>
            </div>
            
            <div class="menu-grid">
                <div class="menu-item">
                    <div style="height: 200px; background: linear-gradient(45deg, #f8c8dc, #ffafcc);"></div>
                    <div class="menu-item-content">
                        <h3>Beef Wellington</h3>
                        <p>Prime beef tenderloin wrapped in puff pastry with mushroom duxelles</p>
                        <div class="price">$42.99</div>
                        <button class="btn" onclick="addToCart('Beef Wellington', 42.99)">Add to Order</button>
                    </div>
                </div>
                
                <div class="menu-item">
                    <div style="height: 200px; background: linear-gradient(45deg, #a2d2ff, #bde0fe);"></div>
                    <div class="menu-item-content">
                        <h3>Truffle Pasta</h3>
                        <p>Fresh handmade pasta with black truffle, parmesan, and cream sauce</p>
                        <div class="price">$28.99</div>
                        <button class="btn" onclick="addToCart('Truffle Pasta', 28.99)">Add to Order</button>
                    </div>
                </div>
                
                <div class="menu-item">
                    <div style="height: 200px; background: linear-gradient(45deg, #ffafcc, #cdb4db);"></div>
                    <div class="menu-item-content">
                        <h3>Seafood Platter</h3>
                        <p>Fresh lobster, scallops, and prawns with lemon butter sauce</p>
                        <div class="price">$38.99</div>
                        <button class="btn" onclick="addToCart('Seafood Platter', 38.99)">Add to Order</button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Reservation Section -->
    <section class="reservation" id="reservation">
        <div class="container">
            <div class="section-title">
                <h2>Make a Reservation</h2>
                <p>Book your table for an unforgettable dining experience</p>
            </div>
            
            <form class="reservation-form" onsubmit="submitReservation(event)">
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" required placeholder="Your name">
                </div>
                
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" required placeholder="your@email.com">
                </div>
                
                <div class="form-group">
                    <label for="date">Date & Time</label>
                    <input type="datetime-local" id="date" required>
                </div>
                
                <div class="form-group">
                    <label for="guests">Number of Guests</label>
                    <select id="guests" required>
                        <option value="">Select guests</option>
                        <option value="1">1 Person</option>
                        <option value="2">2 People</option>
                        <option value="3">3 People</option>
                        <option value="4">4 People</option>
                        <option value="5">5+ People</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="message">Special Requests</label>
                    <textarea id="message" rows="3" placeholder="Any special requirements..."></textarea>
                </div>
                
                <button type="submit" class="btn">Book Now</button>
            </form>
        </div>
    </section>

    <!-- Footer -->
    <footer id="contact">
        <div class="container">
            <div class="footer-content">
                <div>
                    <h3>Contact Us</h3>
                    <p>123 Gourmet Street</p>
                    <p>Food City, FC 10001</p>
                    <p>Phone: (555) 123-4567</p>
                    <p>Email: info@gourmetdemo.com</p>
                </div>
                
                <div>
                    <h3>Hours</h3>
                    <p>Monday - Friday: 5 PM - 11 PM</p>
                    <p>Saturday: 4 PM - 12 AM</p>
                    <p>Sunday: 4 PM - 10 PM</p>
                </div>
                
                <div>
                    <h3>Follow Us</h3>
                    <p>Instagram | Facebook | Twitter</p>
                    <p>Subscribe to our newsletter</p>
                </div>
            </div>
            
            <div class="copyright">
                <p>© 2024 Gourmet Restaurant Demo. Created with AppForge.</p>
                <p>This is a demonstration website for AppForge.</p>
            </div>
        </div>
    </footer>

    <script>
        // Shopping cart functionality
        let cart = [];
        let cartTotal = 0;
        
        function addToCart(item, price) {
            cart.push({ item, price });
            cartTotal += price;
            updateCartDisplay();
            showNotification(item + ' added to cart!');
        }
        
        function updateCartDisplay() {
            const cartCount = document.getElementById('cartCount');
            if (cartCount) {
                cartCount.textContent = cart.length;
            }
        }
        
        function showNotification(message) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #2ec4b6;
                color: white;
                padding: 15px 25px;
                border-radius: 5px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                z-index: 1000;
                animation: slideIn 0.3s;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
        
        // Reservation form handling
        function submitReservation(event) {
            event.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                date: document.getElementById('date').value,
                guests: document.getElementById('guests').value,
                message: document.getElementById('message').value
            };
            
            // In a real app, you would send this to a server
            console.log('Reservation submitted:', formData);
            
            showNotification('Reservation submitted successfully!');
            event.target.reset();
        }
        
        // Add some CSS animations
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        \`;
        document.head.appendChild(style);
        
        // Initialize
        updateCartDisplay();
        console.log('Restaurant demo app loaded successfully!');
    </script>
</body>
</html>`;
}

// Other demo template generators would go here...
// (Portfolio, Business, Ecommerce, Blog, Dashboard)

// ======================
// UTILITY FUNCTIONS
// ======================
function extractCodeFromResponse(response) {
    // Extract code from markdown code blocks if present
    const codeBlockRegex = /```(?:html)?\s*([\s\S]*?)```/;
    const match = response.match(codeBlockRegex);
    
    if (match && match[1]) {
        return match[1].trim();
    }
    
    // If no code blocks, return the whole response
    return response.trim();
}

function displayGeneratedApp(code) {
    if (!code) {
        showMessage('No code generated', 'error');
        return;
    }
    
    currentAppCode = code;
    
    // Display code with syntax highlighting
    document.getElementById('codeOutput').textContent = code;
    
    // Update preview iframe
    const iframe = document.getElementById('appPreview');
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    iframeDoc.open();
    iframeDoc.write(code);
    iframeDoc.close();
    
    console.log('📱 App preview updated');
}

// ======================
// TEMPLATE FUNCTIONS
// ======================
function useTemplate(type) {
    const prompts = {
        restaurant: 'Create a restaurant website with menu, online ordering, and reservation system. Use a warm, inviting design with food photography.',
        portfolio: 'Create a professional portfolio website with projects gallery, skills section, about me, and contact form. Use a modern, clean design.',
        business: 'Create a corporate business website with services, team members, testimonials, and contact information. Professional design.',
        ecommerce: 'Create an e-commerce website with product listings, shopping cart, checkout, and user reviews. Mobile-responsive.',
        blog: 'Create a blog website with article listings, categories, author profiles, and comment system. Clean typography.',
        dashboard: 'Create an admin dashboard with charts, data tables, user management, and statistics. Dark/light theme.'
    };
    
    document.getElementById('appPrompt').value = prompts[type] || prompts.restaurant;
    
    // Auto-generate after selecting template
    setTimeout(() => generateApp(), 300);
}

// ======================
// EXPORT FUNCTIONS
// ======================
function copyCode() {
    if (!currentAppCode) {
        showMessage('No app code to copy', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(currentAppCode).then(() => {
        showMessage('✅ Code copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Copy failed:', err);
        showMessage('Failed to copy code', 'error');
    });
}

function downloadApp() {
    if (!currentAppCode) {
        showMessage('No app to download', 'warning');
        return;
    }
    
    const blob = new Blob([currentAppCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // Generate filename based on app type
    const filename = generateFilename();
    
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage(`✅ App downloaded as ${filename}`, 'success');
}

function generateFilename() {
    const prompt = document.getElementById('appPrompt').value.toLowerCase();
    let type = 'app';
    
    if (prompt.includes('restaurant')) type = 'restaurant';
    else if (prompt.includes('portfolio')) type = 'portfolio';
    else if (prompt.includes('business')) type = 'business';
    else if (prompt.includes('shop') || prompt.includes('ecommerce')) type = 'store';
    else if (prompt.includes('blog')) type = 'blog';
    else if (prompt.includes('dashboard')) type = 'dashboard';
    
    return `appforge-${type}-${Date.now()}.html`;
}

function testInNewTab() {
    if (!currentAppCode) {
        showMessage('No app to test', 'warning');
        return;
    }
    
    const newWindow = window.open();
    if (!newWindow) {
        showMessage('Please allow pop-ups to test the app', 'warning');
        return;
    }
    
    newWindow.document.write(currentAppCode);
    newWindow.document.close();
    
    showMessage('App opened in new tab', 'success');
}

// ======================
// SETTINGS MANAGEMENT
// ======================
function openSettings() {
    document.getElementById('settingsModal').style.display = 'flex';
    document.getElementById('apiKey').value = apiKey || '';
    document.getElementById('apiKey').focus();
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function saveSettings() {
    const newApiKey = document.getElementById('apiKey').value.trim();
    
    if (newApiKey) {
        // Validate API key format
        if (!newApiKey.startsWith('sk-')) {
            showMessage('Invalid API key format. Should start with "sk-"', 'error');
            return;
        }
        
        apiKey = newApiKey;
        isUsingAPIKey = true;
        localStorage.setItem('appforge_api_key', apiKey);
        
        showMessage('✅ API Key saved! Reconnecting...', 'success');
        updateConnectionStatus('🟢 Using Custom API Key');
        
        // Reinitialize connection
        setTimeout(() => initPuterConnection(), 1000);
        
    } else {
        // Clear API key
        apiKey = '';
        isUsingAPIKey = false;
        localStorage.removeItem('appforge_api_key');
        
        showMessage('API Key removed. Using free tier.', 'warning');
        updateConnectionStatus('🟡 Free Mode - Add API Key for AI');
        connectionStatus = 'free';
    }
    
    closeSettings();
}

function loadSavedSettings() {
    const savedKey = localStorage.getItem('appforge_api_key');
    if (savedKey) {
        apiKey = savedKey;
        isUsingAPIKey = true;
        console.log('🔑 Loaded saved API key');
    }
}

// ======================
// UI HELPER FUNCTIONS
// ======================
function showLoading(message) {
    document.getElementById('statusMessage').textContent = message;
    document.getElementById('loadingOverlay').style.display = 'flex';
    
    // Disable buttons during loading
    document.getElementById('generateBtn').disabled = true;
    document.getElementById('demoBtn').disabled = true;
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
    
    // Re-enable buttons
    document.getElementById('generateBtn').disabled = false;
    document.getElementById('demoBtn').disabled = false;
}

function updateStatusMessage(message) {
    document.getElementById('statusMessage').textContent = message;
}

function updateConnectionStatus(status) {
    document.getElementById('connectionStatus').textContent = status;
}

function showMessage(text, type) {
    const popup = document.getElementById('messagePopup');
    popup.textContent = text;
    popup.className = `message-popup ${type}`;
    popup.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        popup.style.display = 'none';
    }, 3000);
}

// ======================
// EVENT LISTENERS
// ======================
function setupEventListeners() {
    // Enter key in prompt triggers generation
    document.getElementById('appPrompt').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            generateApp();
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSettings();
        }
    });
    
    // Close modal when clicking outside
    document.getElementById('settingsModal').addEventListener('click', (e) => {
        if (e.target.id === 'settingsModal') {
            closeSettings();
        }
    });
    
    console.log('✅ Event listeners set up');
}

// ======================
// DEMO MODE
// ======================
function useDemoMode() {
    const prompt = document.getElementById('appPrompt').value.trim() || 
                   'Create a restaurant website with menu, online ordering, and reservation system.';
    const demoCode = generateEnhancedDemoApp(prompt);
    displayGeneratedApp(demoCode);
    showMessage('🎨 Demo app loaded! Add API key for AI features.', 'success');
}

// Export functions for global access
window.generateApp = generateApp;
window.useDemoMode = useDemoMode;
window.useTemplate = useTemplate;
window.copyCode = copyCode;
window.downloadApp = downloadApp;
window.testInNewTab = testInNewTab;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.saveSettings = saveSettings;

console.log('🚀 AppForge JavaScript loaded successfully!');
