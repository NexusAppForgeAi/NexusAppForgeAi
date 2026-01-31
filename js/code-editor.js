// Code Editor for AppForge

class CodeEditor {
    constructor() {
        this.utils = window.utils;
        this.uiManager = window.uiManager;
        this.editorElement = null;
        this.lineNumbersElement = null;
        this.currentCode = '';
        this.isDirty = false;
        this.autoSaveTimeout = null;
        this.init();
    }

    init() {
        this.setupEditor();
        this.setupEventListeners();
        this.setupAutoSave();
        this.loadInitialCode();
    }

    setupEditor() {
        this.editorElement = document.getElementById('codeEditor');
        if (!this.editorElement) {
            console.error('Code editor element not found');
            return;
        }

        // Create line numbers container
        this.createLineNumbers();

        // Set initial content
        this.currentCode = this.editorElement.value;
        this.updateLineNumbers();
        this.updatePreview();

        // Set up syntax highlighting
        this.setupSyntaxHighlighting();

        // Set up auto-format
        this.setupAutoFormat();
    }

    createLineNumbers() {
        const editorContainer = this.editorElement.parentElement;
        if (!editorContainer) return;

        this.lineNumbersElement = document.createElement('div');
        this.lineNumbersElement.className = 'line-numbers';
        editorContainer.insertBefore(this.lineNumbersElement, this.editorElement);
    }

    updateLineNumbers() {
        if (!this.lineNumbersElement) return;

        const lines = this.editorElement.value.split('\n').length;
        let lineNumbersHTML = '';

        for (let i = 1; i <= lines; i++) {
            lineNumbersHTML += `<div class="line-number">${i}</div>`;
        }

        this.lineNumbersElement.innerHTML = lineNumbersHTML;
        
        // Sync scroll
        this.lineNumbersElement.scrollTop = this.editorElement.scrollTop;
    }

    setupEventListeners() {
        if (!this.editorElement) return;

        // Input events
        this.editorElement.addEventListener('input', (e) => {
            this.handleInput(e);
        });

        // Scroll sync
        this.editorElement.addEventListener('scroll', () => {
            if (this.lineNumbersElement) {
                this.lineNumbersElement.scrollTop = this.editorElement.scrollTop;
            }
        });

        // Keyboard shortcuts
        this.editorElement.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });

        // Focus/blur
        this.editorElement.addEventListener('focus', () => {
            this.editorElement.parentElement.classList.add('focused');
        });

        this.editorElement.addEventListener('blur', () => {
            this.editorElement.parentElement.classList.remove('focused');
            this.saveToStorage();
        });

        // Toolbar buttons
        this.setupToolbarButtons();
    }

    setupToolbarButtons() {
        const formatBtn = this.editorElement.parentElement.querySelector('[title="Format Code"]');
        const minifyBtn = this.editorElement.parentElement.querySelector('[title="Minify"]');
        const clearBtn = this.editorElement.parentElement.querySelector('[title="Clear"]');

        if (formatBtn) {
            formatBtn.addEventListener('click', () => this.formatCode());
        }

        if (minifyBtn) {
            minifyBtn.addEventListener('click', () => this.minifyCode());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCode());
        }
    }

    handleInput(e) {
        this.isDirty = true;
        this.currentCode = e.target.value;
        this.updateLineNumbers();
        this.updateStats();
        
        // Trigger auto-save
        this.triggerAutoSave();
        
        // Update preview with debounce
        this.debouncedPreviewUpdate();
    }

    debouncedPreviewUpdate = this.utils.debounce(() => {
        this.updatePreview();
    }, 500);

    handleKeydown(e) {
        // Tab key handling
        if (e.key === 'Tab') {
            e.preventDefault();
            this.insertTab();
        }

        // Auto-indent on Enter
        if (e.key === 'Enter') {
            setTimeout(() => this.autoIndent(), 0);
        }

        // Save shortcut (Ctrl/Cmd + S)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveToStorage();
            this.uiManager.showToast('Code saved', 'success');
        }

        // Format shortcut (Ctrl/Cmd + Shift + F)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
            e.preventDefault();
            this.formatCode();
        }
    }

    insertTab() {
        const start = this.editorElement.selectionStart;
        const end = this.editorElement.selectionEnd;
        const value = this.editorElement.value;

        // Insert tab at cursor position
        this.editorElement.value = value.substring(0, start) + '    ' + value.substring(end);
        
        // Move cursor
        this.editorElement.selectionStart = this.editorElement.selectionEnd = start + 4;
        
        // Trigger input event
        this.editorElement.dispatchEvent(new Event('input'));
    }

    autoIndent() {
        const cursorPos = this.editorElement.selectionStart;
        const value = this.editorElement.value;
        const lines = value.substring(0, cursorPos).split('\n');
        const currentLine = lines[lines.length - 2] || ''; // Previous line
        
        // Count leading spaces/tabs
        const match = currentLine.match(/^(\s*)/);
        const indent = match ? match[1] : '';
        
        // Insert same indentation at cursor position
        const start = this.editorElement.selectionStart;
        this.editorElement.value = value.substring(0, start) + indent + value.substring(start);
        this.editorElement.selectionStart = this.editorElement.selectionEnd = start + indent.length;
        
        this.editorElement.dispatchEvent(new Event('input'));
    }

    setupAutoSave() {
        // Auto-save every 30 seconds if dirty
        setInterval(() => {
            if (this.isDirty) {
                this.saveToStorage();
            }
        }, 30000);
    }

    triggerAutoSave() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        this.autoSaveTimeout = setTimeout(() => {
            if (this.isDirty) {
                this.saveToStorage();
                this.isDirty = false;
            }
        }, 2000);
    }

    saveToStorage() {
        if (!this.currentCode.trim()) return;

        const project = {
            code: this.currentCode,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        this.utils.setStorage('current_project', project);
        
        // Track save event
        this.utils.trackEvent('code_saved', {
            length: this.currentCode.length,
            lines: this.currentCode.split('\n').length
        });
    }

    loadInitialCode() {
        const savedProject = this.utils.getStorage('current_project');
        
        if (savedProject && savedProject.code) {
            this.editorElement.value = savedProject.code;
            this.currentCode = savedProject.code;
            this.updateLineNumbers();
            this.updateStats();
            this.updatePreview();
            
            this.utils.log('Loaded saved project', null, 'info');
        } else {
            // Use default template
            this.loadTemplate('blank');
        }
    }

    updateStats() {
        const lineCount = document.getElementById('lineCount');
        const charCount = document.getElementById('charCount');
        
        if (lineCount) {
            lineCount.textContent = this.currentCode.split('\n').length;
        }
        
        if (charCount) {
            charCount.textContent = this.currentCode.length;
        }
    }

    updatePreview() {
        const previewFrame = document.getElementById('previewFrame');
        if (!previewFrame) return;

        try {
            // Create a complete HTML document
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                            overflow-x: hidden;
                        }
                        .appforge-watermark {
                            position: fixed;
                            bottom: 10px;
                            right: 10px;
                            background: rgba(0,0,0,0.1);
                            padding: 5px 10px;
                            border-radius: 4px;
                            font-size: 12px;
                            color: #666;
                            z-index: 9999;
                        }
                    </style>
                </head>
                <body>
                    ${this.currentCode}
                    <div class="appforge-watermark">Preview - AppForge</div>
                </body>
                </html>
            `;

            // Write to iframe
            previewFrame.srcdoc = html;
        } catch (error) {
            console.error('Preview update error:', error);
        }
    }

    setupSyntaxHighlighting() {
        // Basic syntax highlighting for HTML
        this.editorElement.addEventListener('input', () => {
            this.applySyntaxHighlighting();
        });
    }

    applySyntaxHighlighting() {
        // This is a simplified version - in production, use a proper syntax highlighter
        const code = this.editorElement.value;
        
        // Simple HTML tag highlighting
        let highlighted = code
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'");

        // Highlight HTML tags
        highlighted = highlighted.replace(
            /(&lt;\/?)(\w+)([^&]*)(&gt;)/g,
            '<span class="tag">$1</span><span class="tag-name">$2</span><span class="tag-attr">$3</span><span class="tag">$4</span>'
        );

        // Highlight attributes
        highlighted = highlighted.replace(
            /(\s+)(\w+)(=)(&quot;.*?&quot;|'.*?'|\w+)/g,
            '$1<span class="attr-name">$2</span><span class="attr-equal">$3</span><span class="attr-value">$4</span>'
        );

        // Highlight comments
        highlighted = highlighted.replace(
            /(&lt;!--.*?--&gt;)/g,
            '<span class="comment">$1</span>'
        );

        this.editorElement.innerHTML = highlighted;
    }

    // Code Actions
    formatCode() {
        try {
            // Simple formatter - in production, use a proper formatter like Prettier
            let formatted = this.currentCode;
            
            // Basic indentation
            let indentLevel = 0;
            const lines = formatted.split('\n');
            const formattedLines = [];
            
            for (let line of lines) {
                line = line.trim();
                
                // Decrease indent for closing tags
                if (line.match(/^<\/\w+/)) {
                    indentLevel = Math.max(0, indentLevel - 1);
                }
                
                // Add current indentation
                formattedLines.push('    '.repeat(indentLevel) + line);
                
                // Increase indent for opening tags (that don't self-close)
                if (line.match(/^<\w+[^>]*>$/)) {
                    indentLevel++;
                }
            }
            
            formatted = formattedLines.join('\n');
            
            // Update editor
            this.editorElement.value = formatted;
            this.currentCode = formatted;
            this.isDirty = true;
            
            this.updateLineNumbers();
            this.updateStats();
            this.updatePreview();
            
            this.uiManager.showToast('Code formatted', 'success');
            this.utils.trackEvent('code_formatted');
            
        } catch (error) {
            this.uiManager.showToast('Formatting failed', 'error');
            console.error('Format error:', error);
        }
    }

    minifyCode() {
        try {
            let minified = this.currentCode;
            
            // Remove comments
            minified = minified.replace(/<!--[\s\S]*?-->/g, '');
            
            // Remove whitespace between tags
            minified = minified.replace(/>\s+</g, '><');
            
            // Trim lines
            minified = minified.split('\n').map(line => line.trim()).join('');
            
            // Update editor
            this.editorElement.value = minified;
            this.currentCode = minified;
            this.isDirty = true;
            
            this.updateLineNumbers();
            this.updateStats();
            this.updatePreview();
            
            this.uiManager.showToast('Code minified', 'success');
            this.utils.trackEvent('code_minified');
            
        } catch (error) {
            this.uiManager.showToast('Minification failed', 'error');
            console.error('Minify error:', error);
        }
    }

    clearCode() {
        this.uiManager.confirm('Are you sure you want to clear the editor?', 'Clear Editor')
            .then(confirmed => {
                if (confirmed) {
                    this.editorElement.value = '';
                    this.currentCode = '';
                    this.isDirty = true;
                    
                    this.updateLineNumbers();
                    this.updateStats();
                    this.updatePreview();
                    
                    this.uiManager.showToast('Editor cleared', 'info');
                    this.utils.trackEvent('code_cleared');
                }
            });
    }

    // Template Management
    loadTemplate(templateName) {
        const templates = {
            blank: `<!DOCTYPE html>
<html>
<head>
    <title>My App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .app-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 800px;
            width: 100%;
            text-align: center;
            color: white;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
        }
        
        p {
            font-size: 1.2em;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        
        .btn {
            background: white;
            color: #667eea;
            border: none;
            padding: 15px 30px;
            font-size: 1.1em;
            border-radius: 10px;
            cursor: pointer;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div class="app-container">
        <h1>Welcome to Your App</h1>
        <p>This is a blank template created with AppForge. Start building your amazing application here!</p>
        <button class="btn" onclick="alert('Hello from AppForge!')">
            Get Started
        </button>
    </div>
    
    <script>
        // Your JavaScript code here
        console.log('App loaded successfully!');
    </script>
</body>
</html>`,
            
            todo: `<!DOCTYPE html>
<html>
<head>
    <title>Todo App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        
        .input-group {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
        }
        
        #todoInput {
            flex: 1;
            padding: 15px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 1em;
            outline: none;
            transition: border-color 0.3s;
        }
        
        #todoInput:focus {
            border-color: #f5576c;
        }
        
        #addBtn {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            border: none;
            padding: 15px 25px;
            border-radius: 10px;
            font-size: 1em;
            cursor: pointer;
            transition: transform 0.3s;
        }
        
        #addBtn:hover {
            transform: scale(1.05);
        }
        
        .todo-list {
            list-style: none;
        }
        
        .todo-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: transform 0.3s;
        }
        
        .todo-item:hover {
            transform: translateX(5px);
        }
        
        .todo-item.completed {
            opacity: 0.6;
            text-decoration: line-through;
        }
        
        .todo-text {
            flex: 1;
            margin-left: 10px;
        }
        
        .todo-actions {
            display: flex;
            gap: 10px;
        }
        
        .complete-btn, .delete-btn {
            padding: 5px 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9em;
        }
        
        .complete-btn {
            background: #4CAF50;
            color: white;
        }
        
        .delete-btn {
            background: #f44336;
            color: white;
        }
        
        .stats {
            margin-top: 20px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📝 Todo List</h1>
        
        <div class="input-group">
            <input type="text" id="todoInput" placeholder="Add a new task...">
            <button id="addBtn">Add</button>
        </div>
        
        <ul id="todoList" class="todo-list"></ul>
        
        <div class="stats">
            <span id="totalCount">0</span> tasks total | 
            <span id="completedCount">0</span> completed
        </div>
    </div>
    
    <script>
        let todos = JSON.parse(localStorage.getItem('todos')) || [];
        
        function renderTodos() {
            const todoList = document.getElementById('todoList');
            const totalCount = document.getElementById('totalCount');
            const completedCount = document.getElementById('completedCount');
            
            todoList.innerHTML = '';
            const completed = todos.filter(todo => todo.completed).length;
            
            todos.forEach((todo, index) => {
                const li = document.createElement('li');
                li.className = \`todo-item \${todo.completed ? 'completed' : ''}\`;
                li.innerHTML = \`
                    <input type="checkbox" \${todo.completed ? 'checked' : ''} onchange="toggleTodo(\${index})">
                    <span class="todo-text">\${todo.text}</span>
                    <div class="todo-actions">
                        <button class="delete-btn" onclick="deleteTodo(\${index})">Delete</button>
                    </div>
                \`;
                todoList.appendChild(li);
            });
            
            totalCount.textContent = todos.length;
            completedCount.textContent = completed;
            localStorage.setItem('todos', JSON.stringify(todos));
        }
        
        function addTodo() {
            const input = document.getElementById('todoInput');
            const text = input.value.trim();
            
            if (text) {
                todos.push({ text, completed: false });
                input.value = '';
                renderTodos();
            }
        }
        
        function toggleTodo(index) {
            todos[index].completed = !todos[index].completed;
            renderTodos();
        }
        
        function deleteTodo(index) {
            todos.splice(index, 1);
            renderTodos();
        }
        
        document.getElementById('addBtn').addEventListener('click', addTodo);
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTodo();
        });
        
        renderTodos();
    </script>
</body>
</html>`
        };

        if (templates[templateName]) {
            this.editorElement.value = templates[templateName];
            this.currentCode = templates[templateName];
            this.isDirty = true;
            
            this.updateLineNumbers();
            this.updateStats();
            this.updatePreview();
            
            this.uiManager.showToast(`Loaded "${templateName}" template`, 'success');
            this.utils.trackEvent('template_loaded', { template: templateName });
        }
    }

    // Export Methods
    getCode() {
        return this.currentCode;
    }

    setCode(code) {
        this.editorElement.value = code;
        this.currentCode = code;
        this.isDirty = true;
        
        this.updateLineNumbers();
        this.updateStats();
        this.updatePreview();
    }

    // Import/Export
    exportAsFile(filename = 'app.html') {
        this.utils.downloadFile(filename, this.currentCode, 'text/html');
        this.uiManager.showToast(`Exported as ${filename}`, 'success');
        this.utils.trackEvent('code_exported', { filename });
    }

    importFromFile(file) {
        this.utils.readFile(file)
            .then(content => {
                this.setCode(content);
                this.uiManager.showToast('File imported successfully', 'success');
                this.utils.trackEvent('code_imported', { type: file.type, size: file.size });
            })
            .catch(error => {
                this.uiManager.showToast('Failed to import file', 'error');
                console.error('Import error:', error);
            });
    }

    // Undo/Redo (simplified)
    undo() {
        // In production, implement proper undo/redo stack
        this.uiManager.showToast('Undo feature coming soon', 'info');
    }

    redo() {
        // In production, implement proper undo/redo stack
        this.uiManager.showToast('Redo feature coming soon', 'info');
    }

    // Search/Replace
    find(text) {
        if (!text) return;
        
        const index = this.currentCode.toLowerCase().indexOf(text.toLowerCase());
        if (index !== -1) {
            this.editorElement.focus();
            this.editorElement.setSelectionRange(index, index + text.length);
            
            // Scroll to selection
            const lineHeight = 20; // Approximate line height
            const linesBefore = this.currentCode.substring(0, index).split('\n').length;
            this.editorElement.scrollTop = (linesBefore - 3) * lineHeight;
            
            this.uiManager.showToast(`Found "${text}"`, 'success');
        } else {
            this.uiManager.showToast(`"${text}" not found`, 'warning');
        }
    }

    replace(search, replace) {
        if (!search) return;
        
        const newCode = this.currentCode.replace(new RegExp(search, 'gi'), replace);
        this.setCode(newCode);
        this.uiManager.showToast(`Replaced "${search}" with "${replace}"`, 'success');
    }

    // Error Checking
    checkForErrors() {
        // Basic HTML validation
        const errors = [];
        const code = this.currentCode;
        
        // Check for unclosed tags (simplified)
        const tagRegex = /<(\w+)[^>]*>/g;
        const closingTagRegex = /<\/(\w+)>/g;
        
        const openingTags = [];
        let match;
        
        while ((match = tagRegex.exec(code)) !== null) {
            const tag = match[1];
            if (!match[0].endsWith('/>') && !['br', 'hr', 'img', 'input', 'meta', 'link'].includes(tag.toLowerCase())) {
                openingTags.push(tag.toLowerCase());
            }
        }
        
        while ((match = closingTagRegex.exec(code)) !== null) {
            const tag = match[1].toLowerCase();
            const lastOpening = openingTags.pop();
            if (lastOpening !== tag) {
                errors.push(`Mismatched tags: expected </${lastOpening}>, found </${tag}>`);
            }
        }
        
        if (openingTags.length > 0) {
            errors.push(`Unclosed tags: ${openingTags.map(t => `<${t}>`).join(', ')}`);
        }
        
        return errors;
    }

    validateCode() {
        const errors = this.checkForErrors();
        
        if (errors.length > 0) {
            const errorList = errors.map(e => `<li>${e}</li>`).join('');
            this.uiManager.showModal(
                'Code Validation Errors',
                `<div class="error-list">
                    <p>Found ${errors.length} error(s):</p>
                    <ul>${errorList}</ul>
                </div>`
            );
            return false;
        }
        
        this.uiManager.showToast('Code validation passed', 'success');
        return true;
    }
}

// Create global instance
window.codeEditor = new CodeEditor();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeEditor;
}
