const { contextBridge, ipcRenderer } = require('electron');

// Güvenli API köprüsü
contextBridge.exposeInMainWorld('electronAPI', {
  // Pencere kontrolleri
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  
  // Loading progress
  onLoadingProgress: (callback) => {
    ipcRenderer.on('loading-progress', (event, progress) => callback(progress));
  },
  
  // Sistem bilgileri
  getVersion: () => process.versions.electron,
  getPlatform: () => process.platform,
  
  // Local storage yardımcıları (renderer tarafında kullanılacak)
  // Bu fonksiyonlar aslında renderer'da native localStorage kullanılacak
  // Ama güvenlik için burada da tanımlayabiliriz
});

// Sayfa yüklendiğinde
window.addEventListener('DOMContentLoaded', () => {
  console.log('Zide Store - Preload loaded');
  
  // Sürüm bilgisini sayfaya ekle (eğer varsa)
  const versionElement = document.getElementById('version');
  if (versionElement) {
    versionElement.textContent = `v${process.versions.electron}`;
  }
  
  // Platform sınıfını body'ye ekle
  document.body.classList.add(`platform-${process.platform}`);
});

// Güvenlik: node integration'ı tamamen kapat
delete window.require;
delete window.exports;
delete window.module;
