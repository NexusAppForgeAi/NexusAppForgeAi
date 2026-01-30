// ===== CODE EDITOR =====
// Handles code editing functionality

class CodeEditor {
    constructor() {
        this.editor = document.getElementById('codeEditor');
        this.lineNumbers = document.getElementById('lineNumbers');
        this.currentContent = '';
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoSteps = 50;
        
        this.init();
    }
    
    init() {
        if (!this.editor) return;
        
        // Set up initial content
        this.currentContent = this.editor.value;
        this.updateLineNumbers();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set up syntax highlighting
        this.setupSyntaxHighlighting();
        
        console.log('Code editor initialized');
    }
    
    setupEventListeners() {
        // Update line numbers on input
        this.editor.addEventListener('input', () => {
            this.currentContent = this.editor.value;
            this.updateLineNumbers();
            this.saveToUndoStack();
        });
        
        // Update line numbers on scroll
        this.editor.addEventListener('scroll', () => {
            this.updateLineNumbers();
        });
        
        // Handle keyboard shortcuts
        this.editor.addEventListener('keydown', (e) => {
            // Tab key support
            if (e.key === 'Tab') {
                e.preventDefault();
                this.insertText('\t');
            }
            
            // Ctrl/Cmd + Z for undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
            
            // Ctrl/Cmd + Shift + Z for redo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                this.redo();
            }
            
            // Ctrl/Cmd + Y for redo (Windows/Linux)
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                this.redo();
            }
            
            // Auto-indent on Enter
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleAutoIndent();
            }
            
            // Auto-close brackets
            if (['(', '[', '{', '"', "'", '`'].includes(e.key)) {
                e.preventDefault();
                this.handleAutoClose(e.key);
            }
        });
    }
    
    setupSyntaxHighlighting() {
        // Basic syntax highlighting
        this.editor.addEventListener('input', debounce(() => {
            this.applySyntaxHighlighting();
        }, 300));
    }
    
    updateLineNumbers() {
        if (!this.lineNumbers) return;
        
        const lines = this.editor.value.split('\n').length;
        const scrollTop = this.editor.scrollTop;
        const lineHeight = 22; // Approximate line height
        
        // Create line numbers HTML
        let lineNumbersHTML = '';
        for (let i = 1; i <= lines; i++) {
            lineNumbersHTML += i + '<br>';
        }
        
        this.lineNumbers.innerHTML = lineNumbersHTML;
        
        // Sync scroll position
        this.lineNumbers.scrollTop = scrollTop;
    }
    
    insertText(text) {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const value = this.editor.value;
        
        this.editor.value = value.substring(0, start) + text + value.substring(end);
        this.editor.selectionStart = this.editor.selectionEnd = start + text.length;
        this.editor.focus();
        
        // Trigger input event
        this.editor.dispatchEvent(new Event('input'));
    }
    
    saveToUndoStack() {
        this.undoStack.push(this.currentContent);
        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }
        this.redoStack = []; // Clear redo stack on new action
    }
    
    undo() {
        if (this.undoStack.length === 0) return;
        
        this.redoStack.push(this.currentContent);
        const previousState = this.undoStack.pop();
        this.editor.value = previousState;
        this.currentContent = previousState;
        this.updateLineNumbers();
    }
    
    redo() {
        if (this.redoStack.length === 0) return;
        
        this.undoStack.push(this.currentContent);
        const nextState = this.redoStack.pop();
        this.editor.value = nextState;
        this.currentContent = nextState;
        this.updateLineNumbers();
    }
    
    handleAutoIndent() {
        const cursorPos = this.editor.selectionStart;
        const value = this.editor.value;
        
        // Find start of current line
        let lineStart = cursorPos;
        while (lineStart > 0 && value[lineStart - 1] !== '\n') {
            lineStart--;
        }
        
        // Get current line
        const currentLine = value.substring(lineStart, cursorPos);
        
        // Count leading tabs/spaces
        let indent = '';
        for (let i = 0; i < currentLine.length; i++) {
            if (currentLine[i] === ' ' || currentLine[i] === '\t') {
                indent += currentLine[i];
            } else {
                break;
            }
        }
        
        // Insert new line with same indentation
        this.insertText('\n' + indent);
    }
    
    handleAutoClose(openingChar) {
        const closingPairs = {
            '(': ')',
            '[': ']',
            '{': '}',
            '"': '"',
            "'": "'",
            '`': '`'
        };
        
        const closingChar = closingPairs[openingChar];
        this.insertText(openingChar + closingChar);
        
        // Move cursor between the characters
        const cursorPos = this.editor.selectionStart;
        this.editor.selectionStart = this.editor.selectionEnd = cursorPos - 1;
    }
    
    applySyntaxHighlighting() {
        // Basic syntax highlighting
        // In a real implementation, you would use a library like Prism.js
        // or implement a more sophisticated tokenizer
        
        const code = this.editor.value;
        
        // Simple highlighting for demonstration
        let highlighted = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/(".*?"|'.*?')/g, '<span class="token string">$&</span>')
            .replace(/\b(function|const|let|var|if|else|for|while|return|class|export|import)\b/g, 
                '<span class="token keyword">$&</span>')
            .replace(/\/\/.*/g, '<span class="token comment">$&</span>')
            .replace(/\/\*[\s\S]*?\*\//g, '<span class="token comment">$&</span>');
        
        // Create a temporary element to hold the HTML
        const temp = document.createElement('div');
        temp.innerHTML = highlighted;
        
        // Get the HTML with line breaks preserved
        const html = temp.innerHTML.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
        
        // Store cursor position
        const cursorPos = this.editor.selectionStart;
        
        // Update content
        this.editor.innerHTML = html;
        
        // Restore cursor position
        this.editor.selectionStart = this.editor.selectionEnd = cursorPos;
    }
    
    formatCode() {
        // Basic code formatting
        const code = this.editor.value;
        
        // Format JavaScript/HTML/CSS based on current editor type
        const editorType = window.AppState.currentEditor;
        
        let formattedCode = code;
        
        switch (editorType) {
            case 'html':
                formattedCode = this.formatHTML(code);
                break;
            case 'css':
                formattedCode = this.formatCSS(code);
                break;
            case 'js':
                formattedCode = this.formatJS(code);
                break;
        }
        
        this.editor.value = formattedCode;
        this.currentContent = formattedCode;
        this.updateLineNumbers();
        
        showToast('Code formatted!', 'success');
    }
    
    formatHTML(code) {
        // Basic HTML formatting
        let formatted = code
            .replace(/>\s+</g, '>\n<') // Add newlines between tags
            .replace(/^\s+</gm, '<') // Remove leading spaces
            .replace(/>\s+$/gm, '>'); // Remove trailing spaces
        
        // Indent lines
        let indentLevel = 0;
        const lines = formatted.split('\n');
        const formattedLines = lines.map(line => {
            line = line.trim();
            if (line.startsWith('</')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            const indentedLine = '  '.repeat(indentLevel) + line;
            
            if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>')) {
                indentLevel++;
            }
            
            return indentedLine;
        });
        
        return formattedLines.join('\n');
    }
    
    formatCSS(code) {
        // Basic CSS formatting
        return code
            .replace(/\s*{\s*/g, ' {\n  ')
            .replace(/;\s*/g, ';\n  ')
            .replace(/}\s*/g, '\n}\n\n')
            .replace(/\s+/g, ' ')
            .trim();
    }
    
    formatJS(code) {
        // Basic JavaScript formatting
        return code
            .replace(/\s*{\s*/g, ' {\n  ')
            .replace(/}\s*/g, '\n}\n')
            .replace(/;\s*/g, ';\n  ')
            .replace(/\s+/g, ' ')
            .trim();
    }
    
    minifyCode() {
        const code = this.editor.value;
        const editorType = window.AppState.currentEditor;
        
        let minifiedCode = code;
        
        switch (editorType) {
            case 'html':
                minifiedCode = code.replace(/\s+/g, ' ').trim();
                break;
            case 'css':
                minifiedCode = code.replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
                                  .replace(/\s+/g, ' ') // Collapse whitespace
                                  .replace(/\s*{\s*/g, '{')
                                  .replace(/\s*}\s*/g, '}')
                                  .replace(/\s*:\s*/g, ':')
                                  .replace(/\s*;\s*/g, ';')
                                  .replace(/\s*,\s*/g, ',')
                                  .trim();
                break;
            case 'js':
                minifiedCode = code.replace(/\/\/.*/g, '') // Remove single-line comments
                                  .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
                                  .replace(/\s+/g, ' ') // Collapse whitespace
                                  .replace(/\s*=\s*/g, '=')
                                  .replace(/\s*\+\s*/g, '+')
                                  .replace(/\s*\)\s*/g, ')')
                                  .replace(/\s*\(\s*/g, '(')
                                  .trim();
                break;
        }
        
        this.editor.value = minifiedCode;
        this.currentContent = minifiedCode;
        this.updateLineNumbers();
        
        // Calculate savings
        const originalSize = code.length;
        const minifiedSize = minifiedCode.length;
        const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        
        showToast(`Code minified! Saved ${savings}%`, 'success');
    }
    
    getContent() {
        return this.editor.value;
    }
    
    setContent(content) {
        this.editor.value = content;
        this.currentContent = content;
        this.updateLineNumbers();
        this.applySyntaxHighlighting();
    }
}

// Initialize code editor
let codeEditor = null;

function initCodeEditor() {
    codeEditor = new CodeEditor();
    
    // Export functions to global scope
    window.formatCode = () => codeEditor.formatCode();
    window.minifyCode = () => codeEditor.minifyCode();
    window.getEditorContent = () => codeEditor.getContent();
    window.setEditorContent = (content) => codeEditor.setContent(content);
    
    console.log('Code editor functions exported');
}

// Export
window.initCodeEditor = initCodeEditor;
window.codeEditor = codeEditor;

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}