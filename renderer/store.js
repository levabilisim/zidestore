// Mağaza Verileri
let products = [
    {
        id: 1,
        name: "Gaming Laptop",
    price: 15999.99,
    category: "oyun",
        rating: 4.8,
        image: "https://via.placeholder.com/200x200/333/fff?text=Laptop",
        description: "Yüksek performanslı gaming laptop"
    },
    {
        id: 2,
        name: "Wireless Mouse",
    price: 299.99,
    category: "oyun",
        rating: 4.5,
        image: "https://via.placeholder.com/200x200/333/fff?text=Mouse",
        description: "Kablosuz gaming mouse"
    },
    {
        id: 3,
        name: "JavaScript Kitabı",
    price: 89.99,
    category: "oyun",
        rating: 4.7,
        image: "https://via.placeholder.com/200x200/333/fff?text=Book",
        description: "Modern JavaScript programlama"
    },
    {
        id: 4,
        name: "Gaming T-Shirt",
    price: 159.99,
    category: "oyun",
        rating: 4.3,
        image: "https://via.placeholder.com/200x200/333/fff?text=T-Shirt",
        description: "Rahat gaming tişörtü"
    },
    {
        id: 5,
        name: "Cyberpunk 2077",
    price: 199.99,
    category: "oyun",
        rating: 4.2,
        image: "https://via.placeholder.com/200x200/333/fff?text=Game",
        description: "Aksiyon RPG oyunu"
    },
    {
        id: 6,
        name: "Mechanical Keyboard",
    price: 899.99,
    category: "oyun",
        rating: 4.9,
        image: "https://via.placeholder.com/200x200/333/fff?text=Keyboard",
        description: "RGB mekanik klavye"
    }
];

let cart = [];
let currentUser = localStorage.getItem('currentUser') || 'Kullanıcı';

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    initializeStore();
    loadUserData();
    updateCartDisplay();
    // Wire advanced search product list when available
    if (window.AdvancedSearch) {
        window.AdvancedSearch.setProducts(products);
    }
});

// Mağaza Başlatma
function initializeStore() {
    // Initialize product displays and cart
    renderFeaturedProducts();
    renderAllProducts();
    loadCartFromStorage();
    renderCartItems();
    renderLibrary();
}

// Kullanıcı Verilerini Yükleme
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.name) {
        document.getElementById('profileName').value = userData.name;
        document.getElementById('profileEmail').value = userData.email || '';
        document.getElementById('profilePhone').value = userData.phone || '';
    }
    // Load avatar if exists
    const avatar = localStorage.getItem('profileAvatar');
    if (avatar) {
        const img = document.getElementById('profileAvatarImg');
        if (img) img.src = avatar;
    }

    // Populate profile stats
    updateProfileStats();
}

// Öne Çıkan Ürünleri Render Etme
function renderFeaturedProducts() {
    const featuredGrid = document.getElementById('featuredGrid');
    const featured = products.slice(0, 4); // İlk 4 ürün
    
    featuredGrid.innerHTML = featured.map(product => createProductCard(product)).join('');
    syncAddButtonsWithCart();
}

// Tüm Ürünleri Render Etme
function renderAllProducts() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
    updateResultsCount();
    syncAddButtonsWithCart();
}

// Ürün Kartı Oluşturma
function createProductCard(product) {
    return `
        <div class="product-card" data-category="${product.category}" data-product-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-rating">
                    ${generateStars(product.rating)}
                    <span class="rating-value">${product.rating}</span>
                </div>
                <div class="product-price">₺${product.price.toFixed(2)}</div>
                <div style="display:flex;gap:8px;margin-top:10px;">
                    <button id="addBtn-${product.id}" class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> Sepete Ekle
                    </button>
                    <button class="card-action" onclick="openProductDetail(${product.id})" title="Ayrıntılar">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Yıldız Derecelendirmesi Oluşturma
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Sepete Ekleme
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    // Only allow one of each product
    if (existingItem) {
        showToast('Bu üründen yalnızca 1 adet alabilirsiniz.', 'info');
        return;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartDisplay();
    showToast(`${product.name} sepete eklendi!`, 'success');
    // Update button state
    const btn = document.getElementById(`addBtn-${productId}`);
    if (btn) {
        btn.innerHTML = 'Sepete eklendi';
        btn.disabled = true;
        btn.classList.add('added');
    }
    saveCartToStorage();
}

// Sepetten Çıkarma
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    renderCartItems();
    showToast('Ürün sepetten çıkarıldı!', 'info');
    saveCartToStorage();
    // restore add button
    const btn = document.getElementById(`addBtn-${productId}`);
    if (btn) {
        btn.innerHTML = '<i class="fas fa-cart-plus"></i> Sepete Ekle';
        btn.disabled = false;
        btn.classList.remove('added');
    }
}

// Sepet Miktarını Güncelleme
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartDisplay();
            renderCartItems();
            saveCartToStorage();
        }
    }
}

// Sepet Görünümünü Güncelleme
function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
}

// Sepet Öğelerini Render Etme
function renderCartItems() {
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Sepetiniz boş</div>';
        updateCartSummary();
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>₺${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-controls">
                <button onclick="updateQuantity(${item.id}, -1)" class="quantity-btn">-</button>
                <span class="quantity">${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)" class="quantity-btn">+</button>
            </div>
            <div class="cart-item-total">
                ₺${(item.price * item.quantity).toFixed(2)}
            </div>
            <button onclick="removeFromCart(${item.id})" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    updateCartSummary();
}

// Sepet Özetini Güncelleme
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.18; // %18 KDV
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = `₺${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `₺${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `₺${total.toFixed(2)}`;
}

// Ödeme İşlemi
function checkout() {
    if (cart.length === 0) {
        showToast('Sepetiniz boş!', 'error');
        return;
    }
    
    showLoading();
    
    // Simüle ödeme işlemi
    setTimeout(() => {
        hideLoading();
    // Save purchased items using current cart before clearing it
    savePurchasedItems();
    showToast('Ödeme başarılı! Siparişiniz alındı.', 'success');
    cart = [];
    updateCartDisplay();
    renderCartItems();
    saveCartToStorage();
    renderLibrary();
    showSection('library');
    }, 2000);
}

function savePurchasedItems() {
    const purchased = JSON.parse(localStorage.getItem('purchasedGames') || '[]');
    const existingIds = new Set(purchased.map(p => p.id));
    // Use current cart (before it is cleared)
    cart.forEach(item => {
        if (!existingIds.has(item.id)) {
            // Determine install size (GB) and initial play time
            // Prefer explicit fields, fall back to reasonable mock for game sizes (5-100 GB)
            const installSizeGB = item.installSizeGB || item.playSizeGB || item.sizeGB || Math.max(5, Math.round((Math.random() * 95) + 5));
            const playTimeHours = typeof item.playTimeHours === 'number' ? item.playTimeHours : 0;
            const lastPlayed = item.lastPlayed || null;
            purchased.push({ id: item.id, name: item.name, image: item.image, installSizeGB, playTimeHours, lastPlayed });
            existingIds.add(item.id);
        }
    });
    localStorage.setItem('purchasedGames', JSON.stringify(purchased));
}

function syncAddButtonsWithCart() {
    const cartIds = new Set(cart.map(i => i.id));
    products.forEach(p => {
        const btn = document.getElementById(`addBtn-${p.id}`);
        if (btn) {
            if (cartIds.has(p.id)) {
                btn.innerHTML = 'Sepete eklendi';
                btn.disabled = true;
                btn.classList.add('added');
            } else {
                btn.innerHTML = '<i class="fas fa-cart-plus"></i> Sepete Ekle';
                btn.disabled = false;
                btn.classList.remove('added');
            }
        }
    });
}


function renderLibrary() {
    const grid = document.getElementById('libraryGrid');
    if (!grid) return;
    const purchased = JSON.parse(localStorage.getItem('purchasedGames') || '[]');
    grid.innerHTML = '';
    if (purchased.length === 0) {
        grid.innerHTML = '<div class="library-empty">Henüz oyun satın alınmadı. Keşfet sayfasından oyun satın alın.</div>';
        return;
    }

    // Build table
    const table = document.createElement('table');
    table.className = 'library-table';
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Kapak</th><th>Başlık</th><th>Kurulum (GB)</th><th>Oynama (saat)</th><th>Son Oynama</th><th>Eylemler</th></tr>';
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    purchased.forEach(p => {
        const tr = document.createElement('tr');

        const tdCover = document.createElement('td');
        const img = document.createElement('img');
        img.src = p.image || 'assets/logo.png';
        tdCover.appendChild(img);

        const tdTitle = document.createElement('td');
        tdTitle.innerHTML = `<div style="font-weight:700;color:#fff">${p.name}</div>`;

    const tdInstall = document.createElement('td');
    const installVal = p.installSizeGB || p.playSizeGB || p.sizeGB || p.size || '-';
    tdInstall.innerText = typeof installVal === 'number' ? `${installVal} GB` : installVal;

    const tdPlayHours = document.createElement('td');
    const hoursVal = typeof p.playTimeHours === 'number' ? p.playTimeHours : (p.playTime || 0);
    tdPlayHours.innerText = typeof hoursVal === 'number' ? `${hoursVal} saat` : hoursVal;

    const tdDate = document.createElement('td');
    const last = p.lastPlayed || p.purchasedAt || p.date || null;
    tdDate.innerText = last ? new Date(last).toLocaleString() : '-';

        const tdActions = document.createElement('td');
        const actionsWrap = document.createElement('div');
        actionsWrap.className = 'library-actions';
        const play = document.createElement('button');
        play.className = 'play-btn';
        play.innerText = 'Oyna';
        play.onclick = () => playGame(p.id);
        const down = document.createElement('button');
        down.className = 'download-btn';
        down.innerText = 'İndir';
        down.onclick = () => downloadGame(p.id);
        actionsWrap.appendChild(play);
        actionsWrap.appendChild(down);
        tdActions.appendChild(actionsWrap);

    tr.appendChild(tdCover);
    tr.appendChild(tdTitle);
    tr.appendChild(tdInstall);
    tr.appendChild(tdPlayHours);
    tr.appendChild(tdDate);
    tr.appendChild(tdActions);
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    grid.appendChild(table);
}

// Placeholder actions for library items
function playGame(id) {
    console.log('Play game', id);
    const product = products.find(p => p.id === id) || { name: 'Oyun' };
    alert(`'${product.name}' oyunu başlatılıyor (mock).`);
}

function downloadGame(id) {
    console.log('Download game', id);
    const product = products.find(p => p.id === id) || { name: 'Oyun' };
    alert(`'${product.name}' indiriliyor (mock).`);
}

// Arama Fonksiyonu
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        filterProductsBySearch(query);
    });

    // Titlebar search events should trigger advanced search
    document.addEventListener('titlebar-search', function(e) {
        const q = e.detail.query || '';
        if (window.AdvancedSearch) {
            window.AdvancedSearch.search(q);
        }
    });

    // When advanced search results are ready, show products matching the result set
    document.addEventListener('advanced-search-results', function(e) {
        const results = e.detail.results || [];
        // Hide all cards then show only matches
        const productCards = document.querySelectorAll('#productsGrid .product-card');
        const ids = new Set(results.map(r => r.id));
        productCards.forEach(card => {
            const idAttr = card.getAttribute('data-product-id') || card.querySelector('.add-to-cart-btn')?.getAttribute('onclick')?.match(/addToCart\((\d+)\)/)?.[1];
            const id = idAttr ? parseInt(idAttr, 10) : null;
            if (id && ids.has(id)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        updateResultsCount();
    });

    // Titlebar user menu events
    document.addEventListener('titlebar-user-profile', function() {
        showSection('profile');
    });

    document.addEventListener('titlebar-user-settings', function() {
        showSection('settings');
    });

    document.addEventListener('titlebar-user-orders', function() {
        // For now, navigate to products as placeholder or implement orders later
        showSection('products');
    });

    document.addEventListener('titlebar-user-logout', function() {
        logout();
    });
}

function filterProductsBySearch(query) {
    const productCards = document.querySelectorAll('#productsGrid .product-card');
    productCards.forEach(card => {
        const productName = card.querySelector('.product-name').textContent.toLowerCase();
        const productDesc = card.querySelector('.product-description').textContent.toLowerCase();
        
        if (productName.includes(query) || productDesc.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    updateResultsCount();
}

// Ürün Filtreleme
function filterProducts() {
    const category = document.getElementById('categoryFilter').value;
    const productCards = document.querySelectorAll('#productsGrid .product-card');
    
    productCards.forEach(card => {
        if (!category || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Ürün Sıralama
function sortProducts() {
    const sortBy = document.getElementById('sortBy').value;
    const grid = document.getElementById('productsGrid');
    const cards = Array.from(grid.children);
    
    cards.sort((a, b) => {
        const aName = a.querySelector('.product-name').textContent;
        const bName = b.querySelector('.product-name').textContent;
        const aPrice = parseFloat(a.querySelector('.product-price').textContent.replace('₺', ''));
        const bPrice = parseFloat(b.querySelector('.product-price').textContent.replace('₺', ''));
        const aRating = parseFloat(a.querySelector('.rating-value').textContent);
        const bRating = parseFloat(b.querySelector('.rating-value').textContent);
        
        switch (sortBy) {
            case 'name':
                return aName.localeCompare(bName, 'tr');
            case 'price-low':
                return aPrice - bPrice;
            case 'price-high':
                return bPrice - aPrice;
            case 'rating':
                return bRating - aRating;
            default:
                return 0;
        }
    });
    
    grid.innerHTML = '';
    cards.forEach(card => grid.appendChild(card));
}

// Sayfa Değiştirme
function showSection(sectionName) {
    // Tüm bölümleri gizle
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Tüm nav öğelerini pasif yap
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Seçili bölümü göster
    document.getElementById(sectionName).classList.add('active');
    
    // Seçili nav öğesini aktif yap
    event.target.classList.add('active');
    
    // Sepet sayfasında sepet öğelerini render et
    if (sectionName === 'cart') {
        renderCartItems();
    }
    if (sectionName === 'library') {
        renderLibrary();
    }
}

// Profil Güncelleme
function updateProfile() {
    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    const phone = document.getElementById('profilePhone').value;
    
    const userData = { name, email, phone };
    localStorage.setItem('userData', JSON.stringify(userData));
    
    if (name) {
        currentUser = name;
        localStorage.setItem('currentUser', currentUser);
        
        // Title bar kullanıcı bilgisini güncelle
        if (window.titleBar) {
            window.titleBar.updateUser(currentUser);
        }
    }
    
    showToast('Profil güncellendi!', 'success');
}

// Handle avatar selection
document.addEventListener('DOMContentLoaded', function() {
    const avatarInput = document.getElementById('profileAvatar');
    if (avatarInput) {
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                const dataUrl = ev.target.result;
                localStorage.setItem('profileAvatar', dataUrl);
                const img = document.getElementById('profileAvatarImg');
                if (img) img.src = dataUrl;
                showToast('Avatar kaydedildi.', 'success');
            };
            reader.readAsDataURL(file);
        });
    }
});

function updateProfileStats() {
    const purchased = JSON.parse(localStorage.getItem('purchasedGames') || '[]');
    const gamesCount = purchased.length;
    const totalHours = purchased.reduce((sum, p) => sum + (typeof p.playTimeHours === 'number' ? p.playTimeHours : (p.playTime || 0)), 0);
    const elCount = document.getElementById('profileGamesCount');
    const elHours = document.getElementById('profileTotalHours');
    if (elCount) elCount.textContent = gamesCount;
    if (elHours) elHours.textContent = `${totalHours} saat`;
}

// Profile tab switching
function switchProfileTab(evt, tab) {
    // tabs
    document.querySelectorAll('.profile-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    evt.currentTarget.classList.add('active');
    // panels
    document.querySelectorAll('.tab-panels .tab-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(`tab-${tab}`);
    if (panel) panel.classList.add('active');
    // load tab-specific state
    if (tab === '2fa') load2FAState();
    if (tab === 'verify') loadVerifyState();
}

// Mock security functions
function changePassword() {
    const pw = document.getElementById('newPassword').value;
    if (!pw || pw.length < 6) { showToast('Parola en az 6 karakter olmalı', 'error'); return; }
    // This is a mock - in a real app you'd call the backend
    showToast('Parola güncellendi (mock).', 'success');
}

// 2FA
function load2FAState() {
    const enabled = localStorage.getItem('twoFAEnabled') === 'true';
    document.getElementById('twoFaStatus').innerText = enabled ? 'Etkin' : 'Devre Dışı';
    document.getElementById('toggle2faBtn').innerText = enabled ? 'Kapat 2FA' : 'Aç 2FA';
}

function toggle2FA() {
    const enabled = localStorage.getItem('twoFAEnabled') === 'true';
    localStorage.setItem('twoFAEnabled', (!enabled).toString());
    load2FAState();
    showToast(`2FA ${!enabled ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`, 'success');
}

function generate2FACode() {
    // Mock QR / code
    const code = Math.floor(100000 + Math.random() * 900000);
    showToast(`2FA kurulum kodu: ${code} (mock)`, 'info');
}

// Email verification
function loadVerifyState() {
    const email = document.getElementById('profileEmail').value || '—';
    const verified = localStorage.getItem('emailVerified') === 'true';
    document.getElementById('verifyEmailDisplay').innerText = email;
    document.getElementById('verifyStatus').innerText = verified ? 'Doğrulandı' : 'Doğrulanmadı';
}

function resendVerification() {
    // Mock resend
    showToast('Doğrulama e-postası gönderildi (mock).', 'success');
    localStorage.setItem('emailVerified', 'false');
}

// Privacy
function savePrivacySettings() {
    const share = document.getElementById('shareStats').checked;
    const pub = document.getElementById('showProfilePublic').checked;
    const s = { shareStats: share, showProfilePublic: pub };
    localStorage.setItem('privacySettings', JSON.stringify(s));
    showToast('Gizlilik ayarları kaydedildi.', 'success');
}

// Developer
function regenerateApiKey() {
    const key = 'dev_' + Math.random().toString(36).substring(2, 15);
    document.getElementById('devApiKey').value = key;
    showToast('API anahtarı yenilendi (mock).', 'success');
}

function showDeveloperDocs() {
    alert('Geliştirici dokümantasyonu (mock).');
}

// Ayarları Kaydetme
function saveSettings() {
    const theme = document.querySelector('input[name="theme"]:checked').value;
    const notifications = document.getElementById('notifications').checked;
    const language = document.getElementById('language').value;
    
    const settings = { theme, notifications, language };
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Tema değişikliğini uygula
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }
    
    // Title bar temasını güncelle
    if (window.titleBar) {
        window.titleBar.setTheme(theme);
    }
    
    showToast('Ayarlar kaydedildi!', 'success');
}

// Çıkış Yapma
function logout() {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

// Pencere Kontrolleri
async function minimizeWindow() {
    if (window.electronAPI) {
        await window.electronAPI.minimize();
    }
}

async function maximizeWindow() {
    if (window.electronAPI) {
        await window.electronAPI.maximize();
        
        // Maximize button ikonunu güncelle
        const maximizeBtn = document.querySelector('.maximize i');
        const isMaximized = await window.electronAPI.isMaximized();
        
        if (isMaximized) {
            maximizeBtn.className = 'fas fa-window-restore';
        } else {
            maximizeBtn.className = 'fas fa-square';
        }
    }
}

async function closeWindow() {
    if (window.electronAPI) {
        await window.electronAPI.close();
    }
}

// Yükleme Göstergesi
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

// Toast Bildirimi
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const messageElement = toast.querySelector('.toast-message');
    
    messageElement.textContent = message;
    toast.className = `toast ${type} active`;
    
    setTimeout(() => {
        hideToast();
    }, 3000);
}

function hideToast() {
    document.getElementById('toast').classList.remove('active');
}

// Local Storage İşlemleri
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    syncAddButtonsWithCart();
    }
}

// Sayfa yüklendiğinde sepeti yükle
document.addEventListener('DOMContentLoaded', loadCartFromStorage);

// Gösterilen ürün sayısını güncelle
function updateResultsCount() {
    const visible = Array.from(document.querySelectorAll('#productsGrid .product-card')).filter(c => c.style.display !== 'none');
    const el = document.getElementById('resultsCount');
    if (el) el.textContent = `${visible.length} ürün`;
}

// Ürün detay paneli
function openProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const panel = document.getElementById('productDetail');
    const container = document.getElementById('productDetailContent');
    container.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <div class="product-price">₺${product.price.toFixed(2)}</div>
        <div class="product-rating">${generateStars(product.rating)} <span class="rating-value">${product.rating}</span></div>
        <p style="color:#ccc">${product.description}</p>
        <div style="margin-top:12px;display:flex;gap:8px;">
            <button class="add-to-cart-btn" onclick="addToCart(${product.id});">Sepete Ekle</button>
            <button class="cta ghost" onclick="closeProductDetail()">Kapat</button>
        </div>
    `;
    panel.classList.add('open');
}

function closeProductDetail() {
    const panel = document.getElementById('productDetail');
    if (panel) panel.classList.remove('open');
}
