const { contextBridge, ipcRenderer } = require('electron');

// Güvenli API köprüsü
contextBridge.exposeInMainWorld('electronAPI', {
  // Pencere kontrolleri
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  
  // Development mode
  isDev: process.argv.includes('--dev') || process.argv.includes('--watch'),
  
  // Loading progress
  onLoadingProgress: (callback) => {
    ipcRenderer.on('loading-progress', (event, progress) => callback(progress));
  },
  
  // Auth API
  auth: {
    startRegistration: (userData) => ipcRenderer.invoke('auth-start-registration', userData),
    completeRegistration: (email, code) => ipcRenderer.invoke('auth-complete-registration', email, code),
    resendCode: (email) => ipcRenderer.invoke('auth-resend-code', email),
    cancelRegistration: (email) => ipcRenderer.invoke('auth-cancel-registration', email),
    login: (emailOrUsername, password) => ipcRenderer.invoke('auth-login', emailOrUsername, password),
    getUserInfo: (userId) => ipcRenderer.invoke('auth-get-user-info', userId),
    // Password reset API
    sendResetCode: (email) => ipcRenderer.invoke('auth-send-reset-code', email),
    verifyResetCode: (email, code) => ipcRenderer.invoke('auth-verify-reset-code', email, code),
    resetPassword: (email, newPassword) => ipcRenderer.invoke('auth-reset-password', email, newPassword),
    cancelPasswordReset: (email) => ipcRenderer.invoke('auth-cancel-password-reset', email)
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
