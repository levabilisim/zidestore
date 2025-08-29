/**
 * ZIDE STORE - THEME CONFIGURATION
 * Title Bar ve Uygulama Tema Yönetimi
 */

class ThemeManager {
    constructor() {
        this.themes = {
            dark: {
                name: 'Koyu Tema',
                primary: '#202020',
                secondary: '#1a1a1a',
                accent: '#bb86fc',
                text: '#e1e1e1',
                textSecondary: '#999999',
                border: '#2d2d2d',
                background: '#0d0d0d'
            },
            light: {
                name: 'Açık Tema',
                primary: '#f3f3f3',
                secondary: '#ffffff',
                accent: '#6366f1',
                text: '#323130',
                textSecondary: '#605e5c',
                border: '#e0e0e0',
                background: '#f8f9fa'
            }
        };
        
        this.accentColors = {
            blue: '#0078d4',
            purple: '#8b5cf6',
            green: '#10b981',
            orange: '#f59e0b',
            red: '#ef4444',
            pink: '#ec4899',
            teal: '#14b8a6',
            indigo: '#6366f1'
        };
        
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.currentAccent = localStorage.getItem('accentColor') || 'purple';
        
        this.init();
    }
    
    init() {
        this.applyTheme(this.currentTheme);
        this.applyAccentColor(this.currentAccent);
    }
    
    /**
     * Tema Uygulama
     */
    applyTheme(themeName) {
        if (!this.themes[themeName]) return;
        
        const theme = this.themes[themeName];
        const root = document.documentElement;
        
        // CSS Variables ayarla
        root.style.setProperty('--theme-primary', theme.primary);
        root.style.setProperty('--theme-secondary', theme.secondary);
        root.style.setProperty('--theme-accent', theme.accent);
        root.style.setProperty('--theme-text', theme.text);
        root.style.setProperty('--theme-text-secondary', theme.textSecondary);
        root.style.setProperty('--theme-border', theme.border);
        root.style.setProperty('--theme-background', theme.background);
        
        // Body class güncelle
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${themeName}-theme`);
        
        // Title bar güncelle
        if (window.titleBar) {
            window.titleBar.setTheme(themeName);
        }
        
        this.currentTheme = themeName;
        localStorage.setItem('theme', themeName);
        
        // Event dispatch
        document.dispatchEvent(new CustomEvent('theme-changed', {
            detail: { theme: themeName, colors: theme }
        }));
    }
    
    /**
     * Accent Color Uygulama
     */
    applyAccentColor(colorName) {
        if (!this.accentColors[colorName]) return;
        
        const color = this.accentColors[colorName];
        const root = document.documentElement;
        
        root.style.setProperty('--accent-color', color);
        
        // Title bar güncelle
        if (window.titleBar) {
            window.titleBar.setAccentColor(colorName);
        }
        
        this.currentAccent = colorName;
        localStorage.setItem('accentColor', colorName);
        
        // Event dispatch
        document.dispatchEvent(new CustomEvent('accent-changed', {
            detail: { accent: colorName, color: color }
        }));
    }
    
    /**
     * Tema Değiştirme
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }
    
    /**
     * Mevcut Tema Bilgisi
     */
    getCurrentTheme() {
        return {
            name: this.currentTheme,
            colors: this.themes[this.currentTheme],
            accent: this.currentAccent,
            accentColor: this.accentColors[this.currentAccent]
        };
    }
    
    /**
     * Kullanılabilir Temalar
     */
    getAvailableThemes() {
        return Object.keys(this.themes).map(key => ({
            key,
            name: this.themes[key].name,
            colors: this.themes[key]
        }));
    }
    
    /**
     * Kullanılabilir Accent Colors
     */
    getAvailableAccentColors() {
        return Object.keys(this.accentColors).map(key => ({
            key,
            color: this.accentColors[key]
        }));
    }
    
    /**
     * Auto Theme (System Preference)
     */
    enableAutoTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            const handleChange = (e) => {
                const theme = e.matches ? 'dark' : 'light';
                this.applyTheme(theme);
            };
            
            // İlk kontrol
            handleChange(mediaQuery);
            
            // Değişim dinleyicisi
            mediaQuery.addEventListener('change', handleChange);
            
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }
    
    /**
     * Custom Theme Oluşturma
     */
    createCustomTheme(name, colors) {
        this.themes[name] = {
            name: name.charAt(0).toUpperCase() + name.slice(1),
            ...colors
        };
        
        return this.themes[name];
    }
    
    /**
     * High Contrast Mode
     */
    enableHighContrast() {
        document.body.classList.add('high-contrast');
        localStorage.setItem('highContrast', 'true');
    }
    
    disableHighContrast() {
        document.body.classList.remove('high-contrast');
        localStorage.setItem('highContrast', 'false');
    }
}

// Global Theme Manager
window.themeManager = new ThemeManager();

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl + Alt + T for theme toggle
    if (e.ctrlKey && e.altKey && e.key === 't') {
        e.preventDefault();
        window.themeManager.toggleTheme();
    }
    
    // Ctrl + Alt + H for high contrast
    if (e.ctrlKey && e.altKey && e.key === 'h') {
        e.preventDefault();
        const isHighContrast = document.body.classList.contains('high-contrast');
        if (isHighContrast) {
            window.themeManager.disableHighContrast();
        } else {
            window.themeManager.enableHighContrast();
        }
    }
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}

// Utility Functions
window.themeUtils = {
    setTheme: (theme) => window.themeManager.applyTheme(theme),
    setAccent: (accent) => window.themeManager.applyAccentColor(accent),
    toggleTheme: () => window.themeManager.toggleTheme(),
    getCurrentTheme: () => window.themeManager.getCurrentTheme(),
    getThemes: () => window.themeManager.getAvailableThemes(),
    getAccentColors: () => window.themeManager.getAvailableAccentColors()
};
