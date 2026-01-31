// AI Debugger - Intelligent code debugging assistant

const AIDebugger = {
    // Debug state
    isDebugging: false,
    issues: [],

    // Initialize
    init() {
        this.setupDebuggerUI();
    },

    // Setup debugger UI
    setupDebuggerUI() {
        const editorPanel = document.querySelector('.editor-panel');
        if (!editorPanel) return;

        // Add debug button to toolbar
        const toolbar = editorPanel.querySelector('.editor-toolbar');
        if (toolbar) {
            const debugBtn = document.createElement('button');
            debugBtn.id = 'debugBtn';
            debugBtn.title = 'AI Debug';
            debugBtn.innerHTML = '<i class="fas fa-bug"></i>';
            debugBtn.addEventListener('click', () => this.runDebug());
            toolbar.appendChild(debugBtn);
        }

        // Create debug panel
        const debugPanel = document.createElement('div');
        debugPanel.id = 'debugPanel';
        debugPanel.className = 'debug-panel';
        debugPanel.style.display = 'none';
        debugPanel.innerHTML = `
            <div class="debug-header">
                <h4><i class="fas fa-bug"></i> AI Debugger</h4>
                <button id="closeDebugPanel"><i class="fas fa-times"></i></button>
            </div>
            <div class="debug-content">
                <div class="debug-status" id="debugStatus">
                    <i class="fas fa-check-circle"></i>
                    <span>No issues found</span>
                </div>
                <div class="debug-issues" id="debugIssues"></div>
                <div class="debug-suggestions" id="debugSuggestions"></div>
            </div>
        `;

        editorPanel.appendChild(debugPanel);

        // Close button
        const closeBtn = document.getElementById('closeDebugPanel');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                debugPanel.style.display = 'none';
            });
        }
    },

    // Run debug analysis
    async runDebug() {
        const code = CodeEditor.getCode();
        if (!code.trim()) {
            UIManager.toast('No code to debug!', 'error');
            return;
        }

        this.isDebugging = true;
        
        const debugBtn = document.getElementById('debugBtn');
        if (debugBtn) {
            debugBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }

        UIManager.toast('AI is analyzing your code...', 'info');

        // Run local analysis first
        const localIssues = this.analyzeCodeLocally(code);
        
        // Try AI analysis if available
        let aiIssues = [];
        try {
            if (typeof puter !== 'undefined' && puter.ai) {
                aiIssues = await this.analyzeWithAI(code);
            }
        } catch (error) {
            console.log('AI analysis failed, using local analysis only');
        }

        // Combine issues
        this.issues = [...localIssues, ...aiIssues];

        // Show results
        this.showDebugResults();

        this.isDebugging = false;
        if (debugBtn) {
            debugBtn.innerHTML = '<i class="fas fa-bug"></i>';
        }
    },

    // Local code analysis
    analyzeCodeLocally(code) {
        const issues = [];

        // Check for common HTML issues
        if (!code.includes('<!DOCTYPE html>')) {
            issues.push({
                type: 'warning',
                message: 'Missing DOCTYPE declaration',
                fix: '<!DOCTYPE html>',
                line: 1
            });
        }

        if (!code.includes('<meta charset')) {
            issues.push({
                type: 'warning',
                message: 'Missing charset meta tag',
                fix: '<meta charset="UTF-8">',
                line: this.findLineNumber(code, '<head>')
            });
        }

        if (!code.includes('<meta name="viewport"')) {
            issues.push({
                type: 'warning',
                message: 'Missing viewport meta tag (not mobile-friendly)',
                fix: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
                line: this.findLineNumber(code, '<head>')
            });
        }

        if (!code.includes('<title>')) {
            issues.push({
                type: 'info',
                message: 'Missing title tag',
                fix: '<title>My App</title>',
                line: this.findLineNumber(code, '<head>')
            });
        }

        // Check for unclosed tags
        const unclosedTags = this.findUnclosedTags(code);
        unclosedTags.forEach(tag => {
            issues.push({
                type: 'error',
                message: `Unclosed tag: <${tag}>`,
                fix: `Add closing tag: </${tag}>`,
                line: this.findLineNumber(code, `<${tag}`)
            });
        });

        // Check for inline styles (recommend CSS)
        const inlineStyles = (code.match(/style="[^"]*"/g) || []).length;
        if (inlineStyles > 5) {
            issues.push({
                type: 'info',
                message: `Found ${inlineStyles} inline styles. Consider moving to CSS classes for better maintainability.`,
                fix: 'Extract styles to a <style> section or external CSS file'
            });
        }

        // Check for missing alt attributes on images
        const imagesWithoutAlt = (code.match(/<img(?![^>]*alt=)[^>]*>/gi) || []);
        imagesWithoutAlt.forEach((img, i) => {
            issues.push({
                type: 'warning',
                message: 'Image missing alt attribute (accessibility issue)',
                fix: 'Add alt="description" to the image tag'
            });
        });

        // Check for console.log statements
        const consoleLogs = (code.match(/console\.log\(/g) || []).length;
        if (consoleLogs > 0) {
            issues.push({
                type: 'info',
                message: `Found ${consoleLogs} console.log statement(s). Consider removing for production.`,
                fix: 'Remove or comment out console.log statements'
            });
        }

        // Check for accessibility - form labels
        const inputsWithoutLabels = (code.match(/<input(?![^>]*id=)[^>]*>/gi) || []);
        inputsWithoutLabels.forEach(() => {
            issues.push({
                type: 'warning',
                message: 'Input field without associated label',
                fix: 'Add a <label> element with for attribute matching input id'
            });
        });

        return issues;
    },

    // Find unclosed HTML tags
    findUnclosedTags(code) {
        const selfClosing = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'];
        const tagStack = [];
        const unclosed = [];

        const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
        let match;

        while ((match = tagRegex.exec(code)) !== null) {
            const tag = match[1].toLowerCase();
            const isClosing = match[0].startsWith('</');
            const isSelfClosing = match[0].endsWith('/>') || selfClosing.includes(tag);

            if (isSelfClosing) continue;

            if (isClosing) {
                const lastTag = tagStack.pop();
                if (lastTag !== tag) {
                    if (lastTag) unclosed.push(lastTag);
                }
            } else {
                tagStack.push(tag);
            }
        }

        // Remaining tags in stack are unclosed
        return [...unclosed, ...tagStack];
    },

    // Find line number for a string
    findLineNumber(code, searchStr) {
        const lines = code.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(searchStr)) {
                return i + 1;
            }
        }
        return 1;
    },

    // Analyze with AI
    async analyzeWithAI(code) {
        const prompt = `Analyze this HTML code for issues, best practices, and improvements:

\`\`\`html
${code.substring(0, 2000)}
\`\`\`

Provide a JSON array of issues found. Each issue should have:
- type: "error", "warning", or "info"
- message: description of the issue
- fix: suggested fix
- line: approximate line number (if applicable)

Focus on: HTML validity, accessibility, performance, security, and best practices.`;

        try {
            const response = await puter.ai.chat(prompt, { model: 'x-ai/grok-4.1-fast' });
            
            // Try to parse JSON from response
            const jsonMatch = response.message.content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (error) {
            console.error('AI analysis error:', error);
        }

        return [];
    },

    // Show debug results
    showDebugResults() {
        const panel = document.getElementById('debugPanel');
        const status = document.getElementById('debugStatus');
        const issuesList = document.getElementById('debugIssues');

        if (!panel) return;

        panel.style.display = 'block';

        // Update status
        const errors = this.issues.filter(i => i.type === 'error').length;
        const warnings = this.issues.filter(i => i.type === 'warning').length;
        const infos = this.issues.filter(i => i.type === 'info').length;

        if (errors === 0 && warnings === 0 && infos === 0) {
            status.innerHTML = '<i class="fas fa-check-circle" style="color: #4CAF50;"></i><span>Your code looks great! No issues found.</span>';
            status.className = 'debug-status success';
        } else {
            status.innerHTML = `
                <i class="fas fa-exclamation-triangle" style="color: #FF9800;"></i>
                <span>Found ${errors} error(s), ${warnings} warning(s), ${infos} suggestion(s)</span>
            `;
            status.className = 'debug-status has-issues';
        }

        // Show issues
        if (issuesList) {
            if (this.issues.length === 0) {
                issuesList.innerHTML = '<p class="no-issues">No issues to display</p>';
            } else {
                issuesList.innerHTML = this.issues.map((issue, index) => `
                    <div class="debug-issue ${issue.type}">
                        <div class="issue-icon">
                            <i class="fas fa-${issue.type === 'error' ? 'times-circle' : issue.type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                        </div>
                        <div class="issue-content">
                            <div class="issue-message">${issue.message}</div>
                            ${issue.fix ? `<div class="issue-fix"><strong>Fix:</strong> ${issue.fix}</div>` : ''}
                            ${issue.line ? `<div class="issue-line">Line ${issue.line}</div>` : ''}
                        </div>
                        ${issue.fix && issue.fix.startsWith('<') ? `
                            <button class="apply-fix-btn" data-index="${index}" title="Apply fix">
                                <i class="fas fa-magic"></i> Fix
                            </button>
                        ` : ''}
                    </div>
                `).join('');

                // Add fix handlers
                issuesList.querySelectorAll('.apply-fix-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = parseInt(e.currentTarget.dataset.index);
                        this.applyFix(index);
                    });
                });
            }
        }
    },

    // Apply a fix
    applyFix(index) {
        const issue = this.issues[index];
        if (!issue || !issue.fix) return;

        let code = CodeEditor.getCode();

        // Simple fix application (can be enhanced)
        if (issue.fix.startsWith('<!DOCTYPE')) {
            if (!code.includes('<!DOCTYPE')) {
                code = '<!DOCTYPE html>\n' + code;
            }
        } else if (issue.fix.includes('charset')) {
            code = code.replace('<head>', '<head>\n    <meta charset="UTF-8">');
        } else if (issue.fix.includes('viewport')) {
            code = code.replace('<head>', '<head>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">');
        }

        CodeEditor.setCode(code);
        UIManager.toast('Fix applied!', 'success');
        
        // Re-run debug
        setTimeout(() => this.runDebug(), 500);
    },

    // Get issues count
    getIssuesCount() {
        return this.issues.length;
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    AIDebugger.init();
});

window.AIDebugger = AIDebugger;
