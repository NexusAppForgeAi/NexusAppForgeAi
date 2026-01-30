// Utility Functions for AppForge

class Utils {
    constructor() {
        this.version = '1.0.0';
        this.debug = true;
    }

    // DOM Utilities
    $(selector) {
        return document.querySelector(selector);
    }

    $$(selector) {
        return document.querySelectorAll(selector);
    }

    createElement(tag, classes = '', text = '') {
        const element = document.createElement(tag);
        if (classes) element.className = classes;
        if (text) element.textContent = text;
        return element;
    }

    // Storage Utilities
    setStorage(key, value) {
        try {
            localStorage.setItem(`appforge_${key}`, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    }

    getStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`appforge_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage error:', e);
            return defaultValue;
        }
    }

    removeStorage(key) {
        localStorage.removeItem(`appforge_${key}`);
    }

    clearStorage() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('appforge_')) {
                localStorage.removeItem(key);
            }
        });
    }

    // String Utilities
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    slugify(str) {
        return str
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    truncate(str, length = 100) {
        if (str.length <= length) return str;
        return str.substring(0, length) + '...';
    }

    // Date Utilities
    formatDate(date, format = 'relative') {
        const d = new Date(date);
        
        if (format === 'relative') {
            const now = new Date();
            const diff = now - d;
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (seconds < 60) return 'just now';
            if (minutes < 60) return `${minutes}m ago`;
            if (hours < 24) return `${hours}h ago`;
            if (days < 7) return `${days}d ago`;
            return d.toLocaleDateString();
        }

        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Validation Utilities
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim().length === 0;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }

    // File Utilities
    downloadFile(filename, content, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    // Network Utilities
    async fetchWithTimeout(url, options = {}, timeout = 10000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    }

    // JSON Utilities
    safeParse(json, defaultValue = {}) {
        try {
            return JSON.parse(json);
        } catch {
            return defaultValue;
        }
    }

    // Color Utilities
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    getContrastColor(hexColor) {
        const rgb = this.hexToRgb(hexColor);
        if (!rgb) return '#000000';
        
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    // Random Utilities
    randomId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    randomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    // Array Utilities
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    // Object Utilities
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    mergeObjects(...objects) {
        return objects.reduce((merged, obj) => {
            if (!obj) return merged;
            return { ...merged, ...obj };
        }, {});
    }

    // Event Utilities
    debounce(func, wait) {
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

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Animation Utilities
    animate(element, animation, duration = 300) {
        return new Promise((resolve) => {
            element.classList.add(animation);
            setTimeout(() => {
                element.classList.remove(animation);
                resolve();
            }, duration);
        });
    }

    // Performance Utilities
    measurePerformance(name, func) {
        const start = performance.now();
        const result = func();
        const end = performance.now();
        if (this.debug) {
            console.log(`${name} took ${(end - start).toFixed(2)}ms`);
        }
        return result;
    }

    // Error Handling
    handleError(error, context = '') {
        const errorObj = {
            message: error.message || 'Unknown error',
            context,
            timestamp: new Date().toISOString(),
            stack: error.stack
        };

        if (this.debug) {
            console.error('AppForge Error:', errorObj);
        }

        // Save to storage for debugging
        const errors = this.getStorage('errors', []);
        errors.push(errorObj);
        this.setStorage('errors', errors.slice(-50)); // Keep last 50 errors

        return errorObj;
    }

    // Logging
    log(message, data = null, level = 'info') {
        if (!this.debug && level === 'debug') return;

        const logEntry = {
            level,
            message,
            data,
            timestamp: new Date().toISOString()
        };

        const logs = this.getStorage('logs', []);
        logs.push(logEntry);
        this.setStorage('logs', logs.slice(-100)); // Keep last 100 logs

        const colors = {
            info: '#3366FF',
            warn: '#FFA500',
            error: '#FF3366',
            debug: '#9933FF'
        };

        if (this.debug) {
            console.log(`%c[AppForge ${level.toUpperCase()}]`, `color: ${colors[level] || '#000'}`, message, data || '');
        }
    }

    // Configuration
    getConfig(key, defaultValue = null) {
        const config = this.getStorage('config', {});
        return config[key] !== undefined ? config[key] : defaultValue;
    }

    setConfig(key, value) {
        const config = this.getStorage('config', {});
        config[key] = value;
        this.setStorage('config', config);
        return true;
    }

    // Theme Management
    getTheme() {
        return this.getStorage('theme', 'light');
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.setStorage('theme', theme);
        return theme;
    }

    toggleTheme() {
        const current = this.getTheme();
        const newTheme = current === 'light' ? 'dark' : 'light';
        return this.setTheme(newTheme);
    }

    // Session Management
    startSession() {
        const session = {
            id: this.randomId(16),
            startTime: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };
        this.setStorage('current_session', session);
        return session;
    }

    updateSession() {
        const session = this.getStorage('current_session');
        if (session) {
            session.lastActivity = new Date().toISOString();
            this.setStorage('current_session', session);
        }
        return session;
    }

    endSession() {
        const session = this.getStorage('current_session');
        if (session) {
            session.endTime = new Date().toISOString();
            const sessions = this.getStorage('sessions', []);
            sessions.push(session);
            this.setStorage('sessions', sessions);
            this.removeStorage('current_session');
        }
        return session;
    }

    // Analytics
    trackEvent(eventName, properties = {}) {
        const event = {
            name: eventName,
            properties,
            timestamp: new Date().toISOString(),
            session: this.getStorage('current_session')
        };

        const events = this.getStorage('analytics_events', []);
        events.push(event);
        this.setStorage('analytics_events', events.slice(-1000)); // Keep last 1000 events

        this.log(`Event tracked: ${eventName}`, properties, 'debug');
        return event;
    }
}

// Create global instance
window.utils = new Utils();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
