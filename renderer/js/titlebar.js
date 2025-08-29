/**
 * ZIDE STORE - TITLE BAR MANAGER
 * Windows 11 Style Custom Title Bar
 * Features: Window controls, search, user info, themes
 */

class TitleBarManager {
    constructor(options = {}) {
        this.options = {
            showSearch: true,
            showUser: true,
            theme: 'dark',
            accentColor: 'blue',
            title: 'Zide Store',
            icon: '../assets/logo.png',
            searchPlaceholder: 'Ürün ara...',
            ...options
        };
        
        this.isMaximized = false;
        this.currentUser = localStorage.getItem('currentUser') || 'Kullanıcı';
        this.searchValue = '';
        this.windowActive = true;
        
        this.init();
    }
    
    /**
     * Initialize Title Bar
     */
    init() {
        this.createTitleBar();
        this.bindEvents();
        this.updateTheme();
        this.checkWindowState();
        this.loadUserData();
        
        // Window focus/blur events
        window.addEventListener('focus', () => this.setWindowActive(true));
        window.addEventListener('blur', () => this.setWindowActive(false));
    }
    
    /**
     * Create Title Bar HTML Structure
     */
    createTitleBar() {
        const titleBarHTML = `
            <div class="titlebar ${this.options.theme} accent-${this.options.accentColor}" id="titlebar">
                <!-- Sol Bölüm: Logo ve Başlık -->
                <div class="titlebar-left">
                    <img src="${this.options.icon}" alt="App Icon" class="titlebar-icon" id="titlebar-icon">
                    <span class="titlebar-title" id="titlebar-title">${this.options.title}</span>
                </div>
                
                <!-- Orta Bölüm: Arama veya Boş Alan -->
                ${this.options.showSearch ? this.createSearchSection() : '<div class="titlebar-center-spacer"></div>'}
                
                <!-- Sağ Bölüm: Kullanıcı ve Kontroller -->
                <div class="titlebar-right">
                    ${this.options.showUser ? this.createUserSection() : ''}
                    
                    <!-- Pencere Kontrolleri -->
                    <div class="titlebar-controls">
                        <button class="titlebar-control minimize" id="btn-minimize" title="Küçült">
                            <i class="minimize-icon"></i>
                        </button>
                        <button class="titlebar-control maximize" id="btn-maximize" title="Büyüt">
                            <i class="maximize-icon"></i>
                        </button>
                        <button class="titlebar-control close" id="btn-close" title="Kapat">
                            <i class="close-icon"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Title bar'ı sayfanın başına ekle
        document.body.insertAdjacentHTML('afterbegin', titleBarHTML);
    }
    
    /**
     * Create Search Section HTML
     */
    createSearchSection() {
        return `
            <div class="titlebar-center">
                <div class="titlebar-drag-area-left"></div>
                <div class="titlebar-search">
                    <i class="titlebar-search-icon">🔍</i>
                    <input 
                        type="text" 
                        class="titlebar-search-input" 
                        id="titlebar-search-input"
                        placeholder="${this.options.searchPlaceholder}"
                        autocomplete="off"
                    >
                    <button class="titlebar-search-clear" id="titlebar-search-clear" title="Temizle">×</button>
                </div>
                <div class="titlebar-drag-area-right"></div>
            </div>
        `;
    }
    
    /**
     * Create User Section HTML
     */
    createUserSection() {
        const userInitial = this.currentUser.charAt(0).toUpperCase();
        return `
            <div style="position:relative;">
            <div class="titlebar-user" id="titlebar-user" title="Kullanıcı Profili">
                <div class="titlebar-user-avatar">${userInitial}</div>
                <span class="titlebar-user-name">${this.currentUser}</span>
            </div>
            <div class="titlebar-user-menu" id="titlebar-user-menu" role="menu">
                <div class="menu-item" id="menu-profile"><i class="fas fa-user"></i> Profil</div>
                <div class="menu-item" id="menu-orders"><i class="fas fa-box-open"></i> Siparişler</div>
                <div class="menu-item" id="menu-settings"><i class="fas fa-cog"></i> Ayarlar</div>
                <div class="menu-separator"></div>
                <div class="menu-item" id="menu-logout"><i class="fas fa-sign-out-alt"></i> Çıkış Yap</div>
            </div>
            </div>
        `;
    }
    
    /**
     * Bind Event Listeners
     */
    bindEvents() {
        // Window Controls
        document.getElementById('btn-minimize')?.addEventListener('click', () => this.minimizeWindow());
        document.getElementById('btn-maximize')?.addEventListener('click', () => this.toggleMaximize());
        document.getElementById('btn-close')?.addEventListener('click', () => this.closeWindow());
        
        // Search Functionality
        const searchInput = document.getElementById('titlebar-search-input');
        const searchClear = document.getElementById('titlebar-search-clear');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
            searchInput.addEventListener('keydown', (e) => this.handleSearchKeydown(e));
        }
        
        if (searchClear) {
            searchClear.addEventListener('click', () => this.clearSearch());
        }
        
        // User Profile Click
    const userEl = document.getElementById('titlebar-user');
    userEl?.addEventListener('click', (e) => this.toggleUserMenu(e));

    // Menu action handlers
    document.getElementById('menu-profile')?.addEventListener('click', () => { this.handleUserMenuAction('profile'); });
    document.getElementById('menu-orders')?.addEventListener('click', () => { this.handleUserMenuAction('orders'); });
    document.getElementById('menu-settings')?.addEventListener('click', () => { this.handleUserMenuAction('settings'); });
    document.getElementById('menu-logout')?.addEventListener('click', () => { this.handleUserMenuAction('logout'); });
        
        // Title/Icon Click (Ana sayfaya dön)
        document.getElementById('titlebar-icon')?.addEventListener('click', () => this.handleIconClick());
        document.getElementById('titlebar-title')?.addEventListener('click', () => this.handleIconClick());
        
        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    toggleUserMenu(e) {
        const menu = document.getElementById('titlebar-user-menu');
        if (!menu) return;
        const isOpen = menu.classList.contains('open');
        document.querySelectorAll('.titlebar-user-menu.open').forEach(m => m.classList.remove('open'));
        if (!isOpen) {
            menu.classList.add('open');
            // close menu on outside click
            setTimeout(() => {
                const onDoc = (ev) => {
                    if (!menu.contains(ev.target) && ev.target.id !== 'titlebar-user') {
                        menu.classList.remove('open');
                        document.removeEventListener('click', onDoc);
                    }
                };
                document.addEventListener('click', onDoc);
            }, 10);
        }
    }

    handleUserMenuAction(action) {
        const menu = document.getElementById('titlebar-user-menu');
        if (menu) menu.classList.remove('open');
        switch(action) {
            case 'profile':
                document.dispatchEvent(new CustomEvent('titlebar-user-profile'));
                break;
            case 'orders':
                document.dispatchEvent(new CustomEvent('titlebar-user-orders'));
                break;
            case 'settings':
                document.dispatchEvent(new CustomEvent('titlebar-user-settings'));
                break;
            case 'logout':
                document.dispatchEvent(new CustomEvent('titlebar-user-logout'));
                break;
        }
    }
    
    /**
     * Window Control Methods
     */
    async minimizeWindow() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.minimize();
                this.animateButton('btn-minimize');
            }
        } catch (error) {
            console.error('Minimize error:', error);
        }
    }
    
    async toggleMaximize() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.maximize();
                this.isMaximized = await window.electronAPI.isMaximized();
                this.updateMaximizeButton();
                this.animateButton('btn-maximize');
            }
        } catch (error) {
            console.error('Maximize error:', error);
        }
    }
    
    async closeWindow() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.close();
                this.animateButton('btn-close');
            } else {
                // Fallback for browser testing
                window.close();
            }
        } catch (error) {
            console.error('Close error:', error);
        }
    }
    
    /**
     * Update Maximize Button Icon
     */
    updateMaximizeButton() {
        const maximizeBtn = document.getElementById('btn-maximize');
        if (maximizeBtn) {
            if (this.isMaximized) {
                maximizeBtn.className = 'titlebar-control restore';
                maximizeBtn.title = 'Geri Al';
            } else {
                maximizeBtn.className = 'titlebar-control maximize';
                maximizeBtn.title = 'Büyüt';
            }
        }
    }
    
    /**
     * Search Functionality
     */
    handleSearch(value) {
        this.searchValue = value;
        
        // Trigger custom search event
        const searchEvent = new CustomEvent('titlebar-search', {
            detail: { query: value }
        });
        document.dispatchEvent(searchEvent);
        
        // Auto-suggestions (if needed)
        if (value.length > 2) {
            this.showSearchSuggestions(value);
        } else {
            this.hideSearchSuggestions();
        }
    }
    
    handleSearchKeydown(e) {
        if (e.key === 'Enter') {
            this.executeSearch();
        } else if (e.key === 'Escape') {
            this.clearSearch();
        }
    }
    
    clearSearch() {
        const searchInput = document.getElementById('titlebar-search-input');
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
            this.handleSearch('');
        }
    }
    
    executeSearch() {
        if (this.searchValue.trim()) {
            // Trigger search execute event
            const executeEvent = new CustomEvent('titlebar-search-execute', {
                detail: { query: this.searchValue }
            });
            document.dispatchEvent(executeEvent);
        }
    }
    
    /**
     * User Profile Handling
     */
    handleUserClick() {
        // Trigger user profile event
        const userEvent = new CustomEvent('titlebar-user-click', {
            detail: { user: this.currentUser }
        });
        document.dispatchEvent(userEvent);
    }
    
    handleIconClick() {
        // Navigate to home
        const homeEvent = new CustomEvent('titlebar-home-click');
        document.dispatchEvent(homeEvent);
    }
    
    /**
     * Keyboard Shortcuts
     */
    handleKeyboard(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'f':
                case 'F':
                    e.preventDefault();
                    this.focusSearch();
                    break;
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.closeWindow();
                    break;
                case 'm':
                case 'M':
                    e.preventDefault();
                    this.minimizeWindow();
                    break;
            }
        }
        
        if (e.key === 'F11') {
            e.preventDefault();
            this.toggleMaximize();
        }
    }
    
    /**
     * Focus Search Input
     */
    focusSearch() {
        const searchInput = document.getElementById('titlebar-search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    /**
     * Theme Management
     */
    setTheme(theme) {
        this.options.theme = theme;
        this.updateTheme();
    }
    
    setAccentColor(color) {
        this.options.accentColor = color;
        this.updateTheme();
    }
    
    updateTheme() {
        const titlebar = document.getElementById('titlebar');
        if (titlebar) {
            titlebar.className = `titlebar ${this.options.theme} accent-${this.options.accentColor}`;
            if (!this.windowActive) {
                titlebar.classList.add('inactive');
            }
        }
    }
    
    /**
     * Window State Management
     */
    setWindowActive(active) {
        this.windowActive = active;
        const titlebar = document.getElementById('titlebar');
        if (titlebar) {
            if (active) {
                titlebar.classList.remove('inactive');
            } else {
                titlebar.classList.add('inactive');
            }
        }
    }
    
    async checkWindowState() {
        try {
            if (window.electronAPI) {
                this.isMaximized = await window.electronAPI.isMaximized();
                this.updateMaximizeButton();
            }
        } catch (error) {
            console.error('Window state check error:', error);
        }
    }
    
    /**
     * User Data Management
     */
    loadUserData() {
        // Prefer explicit currentUser, then loggedInUser (object), then userData
        const currentUserRaw = localStorage.getItem('currentUser');
        if (currentUserRaw) {
            this.updateUser(currentUserRaw);
            return;
        }

        const logged = localStorage.getItem('loggedInUser');
        if (logged) {
            try {
                const lu = JSON.parse(logged);
                if (lu.username) {
                    this.updateUser(lu.username);
                    return;
                }
                if (lu.fullName) {
                    this.updateUser(lu.fullName);
                    return;
                }
            } catch (e) {
                // ignore parse errors
            }
        }

        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData.name) {
            this.updateUser(userData.name);
        }
    }
    
    updateUser(username) {
        this.currentUser = username;
        const userNameElement = document.querySelector('.titlebar-user-name');
        const userAvatarElement = document.querySelector('.titlebar-user-avatar');
        
        if (userNameElement) {
            userNameElement.textContent = username;
        }
        
        if (userAvatarElement) {
            userAvatarElement.textContent = username.charAt(0).toUpperCase();
        }
        try {
            localStorage.setItem('currentUser', username);
        } catch (e) {
            // ignore storage errors
        }
    }
    
    /**
     * Animation Utilities
     */
    animateButton(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 100);
        }
    }
    
    /**
     * Search Suggestions (Advanced Feature)
     */
    showSearchSuggestions(query) {
        // Bu özellik isteğe bağlı - gelecekte eklenebilir
        console.log('Search suggestions for:', query);
    }
    
    hideSearchSuggestions() {
        // Suggestions dropdown'ını gizle
    }
    
    /**
     * Public API Methods
     */
    updateTitle(title) {
        this.options.title = title;
        const titleElement = document.getElementById('titlebar-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }
    
    hideSearch() {
        const searchSection = document.querySelector('.titlebar-center');
        if (searchSection) {
            searchSection.style.display = 'none';
        }
    }
    
    showSearch() {
        const searchSection = document.querySelector('.titlebar-center');
        if (searchSection) {
            searchSection.style.display = 'flex';
        }
    }
    
    hideUser() {
        const userSection = document.querySelector('.titlebar-user');
        if (userSection) {
            userSection.style.display = 'none';
        }
    }
    
    showUser() {
        const userSection = document.querySelector('.titlebar-user');
        if (userSection) {
            userSection.style.display = 'flex';
        }
    }
    
    destroy() {
        const titlebar = document.getElementById('titlebar');
        if (titlebar) {
            titlebar.remove();
        }
    }
}

// Global instance
window.TitleBarManager = TitleBarManager;

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Will be initialized by page-specific script
    });
} else {
    // DOM is already ready
    // Will be initialized by page-specific script
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TitleBarManager;
}
