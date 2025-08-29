# Zide Store - Modern Desktop Game Store

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/Electron-26.0.0-blue.svg)](https://electronjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Zide Store, Electron framework kullanılarak geliştirilmiş modern bir masaüstü oyun indirme platformudur. Hem standalone uygulama olarak hem de CLI tool olarak kullanılabilir.

## 🚀 Özellikler

### ✨ Kullanıcı Arayüzü
- **Modern Tasarım**: Dark/light tema desteği
- **Responsive Layout**: CSS Grid ve Flexbox ile esnek tasarım
- **Custom Titlebar**: Frameless window ile özel başlık çubuğu
- **Smooth Animations**: CSS keyframe animasyonları ve geçişler
- **Loading Screen**: Polished loading ekranı ve progress bar
- **Toast Notifications**: Kullanıcı geri bildirimleri

### 🎮 Oyun Platformu Özellikleri
- **Game Library**: Kategorize edilmiş oyun kütüphanesi
- **Advanced Search**: Gelişmiş oyun arama ve filtreleme
- **Download Manager**: Oyun indirme yönetimi ve ilerleme takibi
- **User Profiles**: Kullanıcı hesap yönetimi ve oyun koleksiyonu
- **Game Installation**: Otomatik oyun kurulum ve güncelleme
- **Library Management**: Oyun koleksiyonu ve favori yönetimi

### 🔧 Teknik Özellikler
- **Electron 26.0.0**: En güncel Electron sürümü
- **Modern JavaScript**: ES6+ syntax ve async/await
- **IPC Communication**: Güvenli main-renderer iletişimi
- **Context Isolation**: Güvenlik odaklı preload script
- **Local Storage**: Offline veri yönetimi
- **Cross-platform**: Windows, macOS, Linux desteği

## 📋 Gereksinimler

- **Node.js**: 16.0 veya üzeri
- **npm**: 7.0 veya üzeri (yarn da kullanılabilir)
- **OS**: Windows 10/11, macOS 10.14+, Ubuntu 18.04+

## 🔧 Kurulum

### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/levabilisim/zidestore
cd zidestore
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Uygulamayı Başlatın
```bash
npm start
```

## 🛠️ CLI Kullanımı

Zide Store artık güçlü bir CLI tool olarak da kullanılabilir. Hem lokal hem de global kurulum desteklenir.

### Lokal Kurulum (Geliştirici)
```bash
# Proje klasöründe
npm link

# Artık herhangi bir klasörde kullanabilirsiniz
zide --help
zide start
zide dev
```

### Global Kurulum
```bash
# Projeden global kurulum
npm install -g .

# Veya npm registry'den (yayınlandıktan sonra)
npm install -g zide-store
```

### CLI Komutları

#### Temel Komutlar
```bash
zide start              # Uygulamayı başlat
zide dev                # Development modunda başlat
zide build              # Production build
zide --version          # Versiyon bilgisi
zide --help             # Yardım menüsü
```

#### Build Komutları
```bash
zide build              # Tüm platformlar için build
zide build:win          # Windows executable
zide build:mac          # macOS app bundle
zide build:linux        # Linux AppImage
```

#### Proje Yönetimi
```bash
zide list               # Mevcut npm script'leri listele
zide run <script>       # Herhangi bir npm script'i çalıştır
zide init               # package.json'ı Electron için hazırla
zide init -i            # Gerekli devDependencies'leri kur
```

#### Argüman İletimi
```bash
# Build'e ek argümanlar geçir
zide build -- --win portable --config electron-builder.json

# Dev modunda debug flag'i ile
zide dev -- --inspect --trace-warnings

# Herhangi bir script'e argüman geçir
zide run test -- --watch --coverage
```

### Yeni Proje Başlatma
```bash
# Boş bir klasörde
mkdir my-electron-app
cd my-electron-app
zide init -i

# Bu komut:
# - package.json oluşturur/günceller
# - Electron script'lerini ekler
# - electron ve electron-builder'ı devDependencies olarak kurar
```

## 📦 Build İşlemleri

### Development
```bash
npm run dev
# veya
zide dev
```

### Production Build
```bash
# Tüm platformlar
npm run build
# veya
zide build

# Platform spesifik
npm run build-win    # Windows
npm run build-mac    # macOS
npm run build-linux  # Linux
```

### Build Konfigürasyonu
`package.json` içinde build ayarları mevcuttur:
- **Windows**: NSIS installer
- **macOS**: DMG bundle
- **Linux**: AppImage format

## 📁 Proje Yapısı

```
zide-store/
├── main.js                 # Electron main process
├── preload.js             # Güvenli preload script
├── package.json           # Proje konfigürasyonu
├── bin/
│   └── zide.js           # CLI tool
├── assets/
│   └── logo.png          # Uygulama logosu
└── renderer/
    ├── components/        # UI bileşenleri
    │   ├── scrollbar/     # Özel scrollbar
    │   └── titlebar/      # Custom titlebar
    ├── styles/            # CSS stilleri
    ├── js/                # JavaScript modülleri
    │   ├── search/        # Arama fonksiyonları
    │   ├── theme-manager.js
    │   └── titlebar.js
    ├── loading.html       # Loading ekranı
    ├── login.html         # Giriş sayfası
    ├── store.html         # Ana mağaza
    ├── confirm-exit.html  # Çıkış onayı
    ├── script.js          # Ana renderer script
    ├── store.js           # Mağaza logic
    └── style.css          # Ana stiller
```

## 🎯 Kullanım Kılavuzu

### 1. Uygulama Başlatma
- Loading ekranı ile başlar
- Smooth progress bar animasyonu
- Login sayfasına yönlendirme

### 2. Kullanıcı Hesabı
- **Kayıt**: Minimum 3 karakter kullanıcı adı, 6 karakter şifre
- **Giriş**: Mevcut hesap bilgileri ile
- **Profil**: Kullanıcı bilgileri güncelleme

### 3. Oyun Mağazası Deneyimi
- **Ana Sayfa**: Öne çıkan oyunlar ve kategoriler
- **Oyun Arama**: Gelişmiş filtreleme ve sıralama
- **İndirme Yönetimi**: Oyun indirme, ilerleme takibi
- **Kurulum**: Otomatik oyun kurulum ve güncelleme

### 4. Tema ve Ayarlar
- Dark/light tema değiştirme
- Uygulama ayarları
- Çıkış onayı

## 🔧 Geliştirme

### Geliştirme Ortamı Kurulumu
```bash
# Repository'yi klonla
git clone https://github.com/levabilisim/zidestore
cd zidestore

# Bağımlılıkları kur
npm install

# Development modunda başlat
npm run dev
```

### Yeni Özellik Ekleme
1. **UI Bileşeni**: `renderer/components/` altında yeni klasör
2. **Stil**: `renderer/styles/` veya `style.css`'e ekle
3. **Logic**: `renderer/js/` altında modül oluştur
4. **IPC Handler**: `main.js`'de güvenli API ekle
5. **Preload**: `preload.js`'de expose et

### Güvenlik Prensipleri
- ✅ Context isolation etkin
- ✅ Node integration devre dışı
- ✅ IPC üzerinden güvenli iletişim
- ✅ XSS koruması
- ✅ Sandboxed renderer process

### Kod Standartları
- Modern JavaScript (ES6+)
- Async/await pattern
- Modular yapı
- Consistent naming conventions
- Error handling

## 🐛 Sorun Giderme

### Yaygın Sorunlar

#### CLI Komutları Çalışmıyor
```bash
# Global kurulum kontrolü
npm list -g | grep zide

# Yeniden kurulum
npm uninstall -g zide-store
npm install -g .
```

#### Build Hataları
```bash
# Node.js versiyonu kontrolü
node --version  # 16+ olmalı

# Bağımlılıkları temizle ve yeniden kur
rm -rf node_modules package-lock.json
npm install
```

#### Electron Uygulaması Açılmıyor
```bash
# Development modunda debug
npm run dev -- --inspect

# Console log'ları kontrol et
# main.js'de console.log ekle
```

### Debug Modu
```bash
# Main process debug
npm run dev -- --inspect

# Renderer process debug
# DevTools'u aç (Ctrl+Shift+I)
```

## 🤝 Katkıda Bulunma

1. **Fork** edin
2. **Feature branch** oluşturun (`git checkout -b feature/amazing-feature`)
3. **Commit** edin (`git commit -m 'Add amazing feature'`)
4. **Push** edin (`git push origin feature/amazing-feature`)
5. **Pull Request** açın

### Katkı Rehberi
- Kod standartlarına uyun
- Test coverage ekleyin
- Documentation güncelleyin
- Commit mesajları açıklayıcı olsun

## 📄 Lisans

Bu proje [MIT License](LICENSE) altında lisanslanmıştır.

## 👥 Geliştirici Ekibi

- **Frontend**: Modern CSS, JavaScript ES6+
- **Backend**: Electron Main Process
- **Design**: Material Design principles
- **Security**: Context isolation, secure IPC
- **CLI**: Node.js CLI development

## 🔄 Sürüm Geçmişi

### v1.0.0 (Current)
- ✅ İlk stabil sürüm
- ✅ Temel oyun platformu özellikleri
- ✅ Modern UI/UX tasarım
- ✅ Güvenlik iyileştirmeleri
- ✅ CLI tool entegrasyonu
- ✅ Cross-platform build desteği

### v1.1.0 (Planned)
- 🔄 Advanced game search filters
- 🔄 User preferences and game settings
- 🔄 Offline game library mode
- 🔄 Performance optimizations and caching

## 📞 Destek ve İletişim

- **GitHub Issues**: [Bug reports](https://github.com/levabilisim/zidestore/issues)
- **Discussions**: [Feature requests](https://github.com/levabilisim/zidestore/discussions)
- **Documentation**: [Wiki](https://github.com/levabilisim/zidestore/wiki)

## 🎮 Oyun Platformu Özellikleri

Zide Store, modern oyun mağazası deneyimi sunar:
- **Oyun Kategorileri**: Aksiyon, RPG, Strateji, Spor, vb.
- **İndirme Yönetimi**: Hızlı indirme, pause/resume, çoklu indirme
- **Oyun Kurulumu**: Otomatik kurulum, güncelleme yönetimi
- **Kullanıcı Koleksiyonu**: Satın alınan oyunlar, favoriler, oyun saatleri
- **Sosyal Özellikler**: Arkadaş listesi, oyun önerileri, yorumlar

## 🙏 Teşekkürler

- [Electron](https://electronjs.org/) - Cross-platform desktop apps
- [Font Awesome](https://fontawesome.com/) - Icons
- [Material Design](https://material.io/) - Design principles
- [Steam](https://store.steampowered.com/) - Oyun platformu ilhamı
- [Epic Games Store](https://store.epicgames.com/) - Modern mağaza deneyimi

---

**Zide Store** - Modern masaüstü oyun indirme platformu 🎮

*Built with ❤️ using Electron*
