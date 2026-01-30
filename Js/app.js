// AppForge JavaScript - Works even without Puter.js
console.log("AppForge loaded!");

// Store current app code
let currentAppCode = '';
let isUsingAI = false;
let userAPIKey = '';
let useCustomKey = false;

// Template definitions
const templates = {
    restaurant: "Create a modern restaurant website with menu, online ordering, reservation system, location map, and food gallery. Use warm colors and appetizing images.",
    portfolio: "Create a personal portfolio website with dark theme, project showcase, skills section, about me, contact form, and smooth animations.",
    business: "Create a professional business website with services section, team members, testimonials, contact form, and call-to-action buttons.",
    ecommerce: "Create an e-commerce website with product grid, shopping cart, checkout system, customer reviews, and secure payment options."
};

// Settings Modal Functions
function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
        // Load saved API key
        const savedKey = localStorage.getItem('appforge_api_key');
        if (savedKey) {
            document.getElementById('apiKey').value = savedKey;
            useCustomKey = true;
        }
    }
}

function saveSettings() {
    const apiKeyInput = document.getElementById('apiKey').value.trim();
    
    if (apiKeyInput) {
        localStorage.setItem('appforge_api_key', apiKeyInput);
        userAPIKey = apiKeyInput;
        useCustomKey = true;
        showMessage('✅ API Key saved!', 'success');
    } else {
        localStorage.removeItem('appforge_api_key');
        userAPIKey = '';
        useCustomKey = false;
        showMessage('✅ Using free Puter.js tier', 'success');
    }
    
    // Close modal
    toggleSettings();
}

// Check if Puter.js is available
function checkPuterConnection() {
    if (typeof puter !== 'undefined' && puter.ai) {
        document.getElementById('connectionStatus').innerHTML = 
            useCustomKey ? '🟢 Using Custom API Key' : '🟢 Connected to Puter.js AI';
        document.getElementById('connectionStatus').style.color = '#4CAF50';
        isUsingAI = true;
        return true;
    } else {
        document.getElementById('connectionStatus').innerHTML = '🟡 Puter.js not loaded - Using Demo Mode';
        document.getElementById('connectionStatus').style.color = '#FF9800';
        isUsingAI = false;
        return false;
    }
}

// Use a template
function useTemplate(templateName) {
    if (templates[templateName]) {
        document.getElementById('appPrompt').value = templates[templateName];
        showMessage(`Loaded ${templateName} template!`, 'success');
    }
}

// Generate app with AI or fallback
async function generateApp() {
    const prompt = document.getElementById('appPrompt').value;
    
    if (!prompt.trim()) {
        showMessage('Please describe what you want to build!', 'error');
        return;
    }
    
    // Show loading state
    const generateBtn = document.getElementById('generateBtn');
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateBtn.disabled = true;
    
    try {
        // Check if we can use AI
        if (checkPuterConnection() && isUsingAI) {
            // Try AI generation with custom key if available
            await generateWithAI(prompt);
        } else {
            // Use demo mode
            await generateDemoApp(prompt);
        }
    } catch (error) {
        console.error('Generation error:', error);
        showMessage('Error generating app. Using demo mode instead.', 'warning');
        await generateDemoApp(prompt);
    } finally {
        // Reset button
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
    }
}

// Generate with Puter.js AI
async function generateWithAI(prompt) {
    showMessage('🤖 Using Grok AI to generate your app...', 'success');
    
    const systemPrompt = `You are an expert web developer. Generate a complete HTML page.
    
    Requirements:
    1. Complete HTML document with doctype, html, head, body
    2. Responsive design that works on mobile and desktop
    3. Modern CSS with gradients and animations
    4. Interactive JavaScript elements
    5. Clean, well-commented code
    6. No external dependencies unless absolutely necessary
    
    Create a website for: ${prompt}
    
    Return ONLY the HTML code, no explanations.`;
    
    // Configure Puter.js with custom key if available
    if (useCustomKey && userAPIKey) {
        puter.auth = userAPIKey;
    }
    
    const response = await puter.ai.chat(
        systemPrompt,
        { model: 'x-ai/grok-4.1-fast', max_tokens: 4000 }
    );
    
    currentAppCode = response.message.content;
    displayAndPreview();
    showMessage('✅ App generated with AI!', 'success');
}

// Generate demo app (fallback)
async function generateDemoApp(prompt) {
    showMessage('🎨 Generating demo app...', 'warning');
    
    // Create a nice demo app based on prompt
    currentAppCode = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AppForge Generated App</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            padding: 40px 20px;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        
        header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        h1 {
            font-size: 48px;
            margin-bottom: 15px;
            background: linear-gradient(45deg, #FF3366, #3366FF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .description {
            font-size: 18px;
            line-height: 1.6;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        
        .prompt-box {
            background: rgba(0, 0, 0, 0.3);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            border-left: 4px solid #4CAF50;
        }
        
        .prompt-box h3 {
            margin-bottom: 10px;
            color: #4CAF50;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        
        .feature {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s;
        }
        
        .feature:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.2);
        }
        
        .feature i {
            font-size: 40px;
            margin-bottom: 15px;
            color: #00D1FF;
        }
        
        button {
            background: #FF3366;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 20px;
        }
        
        button:hover {
            background: #ff1a52;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(255, 51, 102, 0.3);
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 20px;
            }
            
            h1 {
                font-size: 36px;
            }
            
            .features {
                grid-template-columns: 1fr;
            }
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🚀 Your AppForge App</h1>
            <p class="description">This app was generated by AppForge. Edit the code to customize it further!</p>
        </header>
        
        <div class="prompt-box">
            <h3><i class="fas fa-lightbulb"></i> Your Prompt:</h3>
            <p>${prompt}</p>
        </div>
        
        <div class="features">
            <div class="feature">
                <i class="fas fa-mobile-alt"></i>
                <h3>Responsive Design</h3>
                <p>Works perfectly on all devices</p>
            </div>
            <div class="feature">
                <i class="fas fa-bolt"></i>
                <h3>Fast Performance</h3>
                <p>Lightning fast loading times</p>
            </div>
            <div class="feature">
                <i class="fas fa-code"></i>
                <h3>Clean Code</h3>
                <p>Well-structured and commented</p>
            </div>
            <div class="feature">
                <i class="fas fa-paint-brush"></i>
                <h3>Modern Design</h3>
                <p>Beautiful and professional</p>
            </div>
        </div>
        
        <div style="text-align: center;">
            <button onclick="showSuccess()">
                <i class="fas fa-rocket"></i> Launch Your App
            </button>
            <p style="margin-top: 20px; font-size: 14px; opacity: 0.7;">
                Generated with ❤️ by AppForge
            </p>
        </div>
    </div>
    
    <script>
        function showSuccess() {
            alert('🎉 Your app is ready! Customize the code to add your specific functionality.');
            
            // Add some confetti effect
            const colors = ['#FF3366', '#3366FF', '#00D1FF', '#4CAF50'];
            for(let i = 0; i < 20; i++) {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.borderRadius = '50%';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '-10px';
                confetti.style.zIndex = '9999';
                document.body.appendChild(confetti);
                
                confetti.animate([
                    { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                    { transform: 'translateY(100vh) rotate(360deg)', opacity: 0 }
                ], {
                    duration: 1000 + Math.random() * 1000,
                    easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
                });
                
                setTimeout(() => confetti.remove(), 2000);
            }
        }
        
        console.log('AppForge demo app loaded successfully!');
    </script>
</body>
</html>`;
    
    displayAndPreview();
    showMessage('✅ Demo app generated!', 'success');
}

// Demo mode only
function useDemoMode() {
    const prompt = document.getElementById('appPrompt').value || "Create a simple landing page";
    generateDemoApp(prompt);
}

// Display code and update preview
function displayAndPreview() {
    // Display code
    const codeOutput = document.getElementById('codeOutput');
    codeOutput.textContent = currentAppCode;
    
    // Update preview
    const previewFrame = document.getElementById('appPreview');
    const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
    
    previewDoc.open();
    previewDoc.write(currentAppCode);
    previewDoc.close();
    
    // Enable download button
    document.getElementById('downloadBtn').disabled = false;
}

// Copy code to clipboard
function copyCode() {
    if (!currentAppCode) {
        showMessage('Generate an app first!', 'error');
        return;
    }
    
    navigator.clipboard.writeText(currentAppCode).then(() => {
        showMessage('✅ Code copied to clipboard!', 'success');
    }).catch(err => {
        showMessage('❌ Failed to copy code', 'error');
    });
}

// Download app as HTML file
function downloadApp() {
    if (!currentAppCode) {
        showMessage('Generate an app first!', 'error');
        return;
    }
    
    const blob = new Blob([currentAppCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appforge-app.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('✅ App downloaded! Open the .html file in your browser.', 'success');
}

// Test app in new tab
function testInNewTab() {
    if (!currentAppCode) {
        showMessage('Generate an app first!', 'error');
        return;
    }
    
    const newWindow = window.open();
    newWindow.document.write(currentAppCode);
    newWindow.document.close();
}

// Show message notification
function showMessage(text, type) {
    // Remove existing messages
    const existing = document.querySelector('.status-message');
    if (existing) existing.remove();
    
    // Create new message
    const message = document.createElement('div');
    message.className = `status-message ${type}`;
    message.textContent = text;
    document.body.appendChild(message);
    
    // Remove after 4 seconds
    setTimeout(() => {
        message.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => message.remove(), 300);
    }, 4000);
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
    // Load saved API key
    const savedKey = localStorage.getItem('appforge_api_key');
    if (savedKey) {
        userAPIKey = savedKey;
        useCustomKey = true;
        console.log('Custom API key loaded from storage');
    }
    
    // Check connection
    setTimeout(checkPuterConnection, 1000);
    
    // Set default prompt if empty
    const promptField = document.getElementById('appPrompt');
    if (!promptField.value) {
        promptField.value = templates.restaurant;
    }
    
    // Auto-generate demo app after 2 seconds
    setTimeout(() => {
        if (checkPuterConnection() && isUsingAI) {
            // Try AI if available
            generateApp();
        } else {
            // Otherwise use demo
            useDemoMode();
        }
    }, 2000);
});
