// Form doğrulama
function validateForm(username, password) {
    if (!username.trim()) {
        showError("Kullanıcı adı gerekli!");
        return false;
    }
    
    if (username.length < 3) {
        showError("Kullanıcı adı en az 3 karakter olmalı!");
        return false;
    }
    
    if (!password) {
        showError("Şifre gerekli!");
        return false;
    }
    
    if (password.length < 6) {
        showError("Şifre en az 6 karakter olmalı!");
        return false;
    }
    
    return true;
}

// Hata mesajı gösterme
function showError(message) {
    // Önceki hata mesajını temizle
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Yeni hata mesajı oluştur
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #e74c3c;
        background: rgba(231, 76, 60, 0.1);
        border: 1px solid #e74c3c;
        padding: 10px;
        border-radius: 5px;
        margin: 10px 0;
        text-align: center;
        animation: shake 0.5s ease-in-out;
    `;
    
    const container = document.querySelector('.login-container');
    const firstInput = container.querySelector('input');
    container.insertBefore(errorDiv, firstInput);
    
    // 3 saniye sonra kaldır
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Başarı mesajı gösterme
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        color: #27ae60;
        background: rgba(39, 174, 96, 0.1);
        border: 1px solid #27ae60;
        padding: 10px;
        border-radius: 5px;
        margin: 10px 0;
        text-align: center;
        animation: fadeIn 0.5s ease-in-out;
    `;
    
    const container = document.querySelector('.login-container');
    const firstInput = container.querySelector('input');
    container.insertBefore(successDiv, firstInput);
}

// Loading göstergesi
function showLoading(button) {
    const originalText = button.textContent;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yükleniyor...';
    
    return () => {
        button.disabled = false;
        button.textContent = originalText;
    };
}

// Giriş yapma
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const loginBtn = event.target;
    
    // Form doğrulama
    if (!validateForm(username, password)) {
        return;
    }
    
    // Loading başlat
    const stopLoading = showLoading(loginBtn);
    
    // Simüle giriş işlemi
    setTimeout(() => {
        stopLoading();
        
        // Kullanıcı bilgilerini sakla
        localStorage.setItem('currentUser', username);
        localStorage.setItem('isLoggedIn', 'true');
        
        // Varsayılan kullanıcı verileri
        const userData = {
            name: username,
            email: `${username}@example.com`,
            phone: '+90 555 123 4567'
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        showSuccess("Giriş başarılı! Yönlendiriliyor...");
        
        // Ana sayfaya yönlendir
        setTimeout(() => {
            window.location.href = 'store.html';
        }, 1000);
        
    }, 1500); // 1.5 saniye simüle bekleme
}

// Kayıt olma
function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const registerBtn = event.target;
    
    // Form doğrulama
    if (!validateForm(username, password)) {
        return;
    }
    
    // Loading başlat
    const stopLoading = showLoading(registerBtn);
    
    // Simüle kayıt işlemi
    setTimeout(() => {
        stopLoading();
        
        // Kullanıcı zaten var mı kontrolü (simüle)
        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        if (existingUsers.includes(username)) {
            showError("Bu kullanıcı adı zaten kayıtlı!");
            return;
        }
        
        // Yeni kullanıcıyı kaydet
        existingUsers.push(username);
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
        
        // Kullanıcı bilgilerini sakla
        localStorage.setItem('currentUser', username);
        localStorage.setItem('isLoggedIn', 'true');
        
        // Varsayılan kullanıcı verileri
        const userData = {
            name: username,
            email: `${username}@example.com`,
            phone: ''
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        showSuccess("Kayıt başarılı! Yönlendiriliyor...");
        
        // Ana sayfaya yönlendir
        setTimeout(() => {
            window.location.href = 'store.html';
        }, 1000);
        
    }, 2000); // 2 saniye simüle bekleme
}

// Enter tuşu ile giriş
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    });
    
    // Otomatik odaklanma
    document.getElementById('username').focus();
    
    // Zaten giriş yapılmışsa ana sayfaya yönlendir
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'store.html';
    }
});

// Sayfa geçiş fonksiyonları (store.html için)
function showSection(sectionName) {
    // Tüm bölümleri gizle
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Seçilen bölümü göster
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Navigasyon aktif durumunu güncelle
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Tıklanan nav item'ı aktif yap
    const activeNav = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
}

// CSS animasyonları ekle
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .login-container input:focus {
        box-shadow: 0 0 0 3px rgba(187, 134, 252, 0.3);
    }
    
    .login-container button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .fas {
        font-family: "Font Awesome 5 Free";
        font-weight: 900;
    }
    
    .fa-spin {
        animation: fa-spin 2s infinite linear;
    }
    
    @keyframes fa-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(359deg); }
    }
`;
document.head.appendChild(style);
