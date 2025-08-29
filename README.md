# Zide Store - Modern E-Commerce Desktop Application

Zide Store, Electron framework'ü kullanılarak geliştirilmiş modern bir masaüstü e-ticaret uygulamasıdır.

## 🚀 Özellikler

### ✨ Kullanıcı Arayüzü
- Modern ve kullanıcı dostu dark/light tema
- Responsive tasarım
- Özel başlık çubuğu (frameless window)
- Animasyonlu loading ekranı
- Toast bildirimleri
- Gelişmiş arama ve filtreleme

### 🛒 E-ticaret Özellikleri
- Ürün katalogu ve detay sayfaları
- Alışveriş sepeti yönetimi
- Kategori bazlı filtreleme
- Fiyat ve puan sıralaması
- Ödeme simülasyonu
- Kullanıcı profil yönetimi

### 🔧 Teknik Özellikler
- Electron 26.0.0
- Modern JavaScript (ES6+)
- IPC iletişimi (Main ↔ Renderer)
- Local Storage veri yönetimi
- Güvenli preload script
- Context isolation

### 🎨 UI/UX Özellikleri
- Font Awesome ikonları
- CSS Grid ve Flexbox layout
- Keyframe animasyonları
- Hover efektleri
- Responsive breakpoints

## 📋 Gereksinimler

- Node.js (16.0 veya üzeri)
- npm veya yarn
- Windows 10/11, macOS 10.14+, veya Linux

## 🔧 Kurulum

1. **Repository'yi klonlayın:**
```bash
git clone [repository-url]
cd zide-store
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Uygulamayı başlatın:**
```bash
npm start
```

## 📦 Build İşlemleri

### Development Build
```bash
npm run dev
```

### Production Build (Tüm platformlar)
```bash
npm run build
```

### Platform Spesifik Build
```bash
# Windows
npm run build-win

# macOS
npm run build-mac

# Linux
npm run build-linux
```

## 📁 Proje Yapısı

```
zide-store/
├── main.js                 # Ana Electron process
├── preload.js             # Preload script (güvenlik köprüsü)
├── package.json           # Proje konfigürasyonu
├── assets/
│   └── logo.png          # Uygulama logosu
└── renderer/
    ├── loading.html      # Yükleme ekranı
    ├── login.html        # Giriş sayfası
    ├── store.html        # Ana mağaza sayfası
    ├── confirm-exit.html # Çıkış onay sayfası
    ├── script.js         # Login sayfası JS
    ├── store.js          # Ana mağaza JS
    └── style.css         # Tüm stiller
```

## 🎯 Kullanım

### 1. Giriş Yapma
- Kullanıcı adı (minimum 3 karakter)
- Şifre (minimum 6 karakter)
- Kayıt ol veya giriş yap

### 2. Mağaza Gezinme
- **Ana Sayfa:** Öne çıkan ürünler
- **Ürünler:** Tüm ürünler, filtreleme ve sıralama
- **Sepet:** Sepet yönetimi ve ödeme
- **Profil:** Kullanıcı bilgileri güncelleme
- **Ayarlar:** Tema ve uygulama ayarları

### 3. Alışveriş
- Ürünleri sepete ekleme
- Miktar güncelleme
- Ödeme simülasyonu
- Sipariş onayı

## 🔧 Geliştirme

### Yeni Özellik Ekleme
1. `renderer/` dizininde yeni HTML/JS dosyaları oluşturun
2. `style.css`'e gerekli stilleri ekleyin
3. `main.js`'de gerekli IPC handlers'ları ekleyin
4. `preload.js`'de güvenli API'leri expose edin

### Güvenlik
- Context isolation etkin
- Node integration devre dışı
- IPC üzerinden güvenli iletişim
- XSS koruması

## 🐛 Bilinen Sorunlar

- Font Awesome ikonları internet bağlantısı gerektirir
- Local storage veriler uygulama kaldırıldığında silinir
- Ödeme sistemi simülasyon amaçlıdır

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 👥 Geliştirici Ekibi

- **Frontend:** Modern CSS, JavaScript ES6+
- **Backend:** Electron Main Process
- **Design:** Material Design principles
- **Security:** Context isolation, secure IPC

## 🔄 Sürüm Geçmişi

### v1.0.0 (Current)
- İlk stabil sürüm
- Temel e-ticaret özellikleri
- Modern UI/UX
- Güvenlik iyileştirmeleri

## 📞 Destek

Sorunlar için GitHub Issues kullanın veya [email] ile iletişime geçin.

---

**Zide Store** - Modern masaüstü alışveriş deneyimi 🛍️
