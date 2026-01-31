// Code Editor - Handles code editing functionality

const CodeEditor = {
    // Code history for undo/redo
    history: [],
    historyIndex: -1,
    maxHistory: 50,

    // Initialize
    init() {
        this.setupEditor();
        this.setupToolbar();
        this.setupKeyboardShortcuts();
    },

    // Setup editor
    setupEditor() {
        const editor = document.getElementById('codeEditor');
        if (!editor) return;

        // Save initial state
        this.saveHistory();

        // Track changes
        editor.addEventListener('input', Utils.debounce(() => {
            this.saveHistory();
            this.updatePreview();
        }, 500));

        // Tab key support
        editor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                this.insertTab();
            }
        });

        // Sync scroll with line numbers
        editor.addEventListener('scroll', () => {
            const lineNumbers = document.getElementById('lineNumbers');
            if (lineNumbers) {
                lineNumbers.scrollTop = editor.scrollTop;
            }
        });
    },

    // Setup toolbar buttons
    setupToolbar() {
        // Format button
        const formatBtn = document.getElementById('formatCodeBtn');
        if (formatBtn) {
            formatBtn.addEventListener('click', () => this.formatCode());
        }

        // Minify button
        const minifyBtn = document.getElementById('minifyCodeBtn');
        if (minifyBtn) {
            minifyBtn.addEventListener('click', () => this.minifyCode());
        }

        // Beautify button
        const beautifyBtn = document.getElementById('beautifyCodeBtn');
        if (beautifyBtn) {
            beautifyBtn.addEventListener('click', () => this.beautifyCode());
        }

        // Undo button
        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undo());
        }

        // Redo button
        const redoBtn = document.getElementById('redoBtn');
        if (redoBtn) {
            redoBtn.addEventListener('click', () => this.redo());
        }
    },

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Z - Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }

            // Ctrl/Cmd + Shift + Z - Redo
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
                e.preventDefault();
                this.redo();
            }

            // Ctrl/Cmd + S - Save (prevent browser save)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.downloadCode();
            }
        });
    },

    // Get current code
    getCode() {
        const editor = document.getElementById('codeEditor');
        return editor ? editor.value : '';
    },

    // Set code
    setCode(code) {
        const editor = document.getElementById('codeEditor');
        if (editor) {
            editor.value = code;
            this.saveHistory();
            this.updateLineNumbers();
            this.updatePreview();
        }
    },

    // Update line numbers
    updateLineNumbers() {
        const editor = document.getElementById('codeEditor');
        const lineNumbers = document.getElementById('lineNumbers');
        
        if (editor && lineNumbers) {
            const lines = editor.value.split('\n').length;
            lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
        }
    },

    // Insert tab at cursor
    insertTab() {
        const editor = document.getElementById('codeEditor');
        if (!editor) return;

        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const value = editor.value;
        const tabSize = Utils.storage.get('appforge_tabSize', 4);
        const indent = ' '.repeat(tabSize);

        editor.value = value.substring(0, start) + indent + value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + tabSize;
        
        this.saveHistory();
    },

    // Save to history
    saveHistory() {
        const code = this.getCode();
        
        // Don't save if same as current
        if (this.historyIndex >= 0 && this.history[this.historyIndex] === code) {
            return;
        }

        // Remove future history if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        // Add new state
        this.history.push(code);

        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    },

    // Undo
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const editor = document.getElementById('codeEditor');
            if (editor) {
                editor.value = this.history[this.historyIndex];
                this.updateLineNumbers();
                this.updatePreview();
            }
        }
    },

    // Redo
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const editor = document.getElementById('codeEditor');
            if (editor) {
                editor.value = this.history[this.historyIndex];
                this.updateLineNumbers();
                this.updatePreview();
            }
        }
    },

    // Format code (basic HTML formatting)
    formatCode() {
        let code = this.getCode();
        
        // Simple HTML formatting
        code = this.beautifyHTML(code);
        
        this.setCode(code);
        UIManager.toast('Code formatted!', 'success');
    },

    // Beautify HTML
    beautifyHTML(html) {
        let formatted = '';
        let indent = 0;
        const tabSize = Utils.storage.get('appforge_tabSize', 4);
        const tab = ' '.repeat(tabSize);
        
        html.split(/(<[^>]+>)/g).filter(s => s.trim()).forEach((element) => {
            if (element.match(/^<\/\w/)) {
                indent--;
            }
            
            formatted += tab.repeat(Math.max(0, indent)) + element.trim() + '\n';
            
            if (element.match(/^<\w[^>]*[^\/]>.*$/)) {
                indent++;
            } else if (element.match(/^<\w[^>]*\/>/)) {
                // Self-closing tag, no indent change
            }
        });
        
        return formatted.trim();
    },

    // Minify code
    minifyCode() {
        let code = this.getCode();
        
        // Remove comments
        code = code.replace(/<!--[\s\S]*?-->/g, '');
        code = code.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Remove extra whitespace
        code = code.replace(/>\s+</g, '><');
        code = code.replace(/\s{2,}/g, ' ');
        code = code.replace(/\n/g, '');
        
        this.setCode(code);
        UIManager.toast('Code minified!', 'success');
    },

    // Beautify code
    beautifyCode() {
        this.formatCode();
    },

    // Update preview iframe
    updatePreview() {
        const preview = document.getElementById('appPreview');
        const code = this.getCode();
        
        if (preview && code) {
            const doc = preview.contentDocument || preview.contentWindow.document;
            doc.open();
            doc.write(code);
            doc.close();
        }
    },

    // Download code
    downloadCode() {
        const code = this.getCode();
        if (!code.trim()) {
            UIManager.toast('No code to download!', 'error');
            return;
        }

        // Add attribution if needed
        const finalCode = LicenseManager.addAttribution(code);

        Utils.downloadFile(finalCode, 'appforge-app.html', 'text/html');
        
        // Track export
        UserManager.addExportHistory('html', 'appforge-app.html', finalCode.length);
        UserManager.trackUsage('htmlExports');
        
        UIManager.toast('App downloaded!', 'success');
    },

    // Copy code to clipboard
    async copyCode() {
        const code = this.getCode();
        if (!code.trim()) {
            UIManager.toast('No code to copy!', 'error');
            return;
        }

        const success = await Utils.copyToClipboard(code);
        if (success) {
            UIManager.toast('Code copied to clipboard!', 'success');
        } else {
            UIManager.toast('Failed to copy code', 'error');
        }
    },

    // Test in new tab
    testInNewTab() {
        const code = this.getCode();
        if (!code.trim()) {
            UIManager.toast('No code to test!', 'error');
            return;
        }

        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(code);
            newWindow.document.close();
        } else {
            UIManager.toast('Popup blocked! Please allow popups.', 'error');
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    CodeEditor.init();
});

window.CodeEditor = CodeEditor;
