const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const authService = require('./auth/authService');

// Development hot reload
const isDev = process.argv.includes('--dev') || process.argv.includes('--watch');
if (isDev) {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit'
    });
    console.log('! Hot reload enabled!');
  } catch (err) {
    console.log('ℹ️  electron-reload not available, continuing without hot reload');
  }
}

let loadingWindow;
let mainWindow;

function createLoadingWindow() {
  loadingWindow = new BrowserWindow({
    width: 800,
    height: 800,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    transparent: false,
    center: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  loadingWindow.setMenu(null);
  loadingWindow.loadFile(path.join(__dirname, 'renderer/loading.html'));
  loadingWindow.show();

  // Gerçek yükleme süreci simülasyonu
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 8;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
      setTimeout(() => {
        createMainWindow();
        if (loadingWindow && !loadingWindow.isDestroyed()) {
          loadingWindow.close();
        }
      }, 800);
    }
    
    // Progress bilgisini loading window'a gönder
    if (loadingWindow && !loadingWindow.isDestroyed()) {
      loadingWindow.webContents.send('loading-progress', Math.min(progress, 100));
    }
  }, 300);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.setMenu(null);
  mainWindow.loadFile(path.join(__dirname, 'renderer/login.html'));

  // Pencere hazır olduğunda göster
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Development mode'da DevTools'u aç
    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // Pencere kapatıldığında
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Event Handlers
ipcMain.handle('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window-close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

// Auth IPC Handlers
ipcMain.handle('auth-start-registration', async (event, userData) => {
  try {
    return await authService.startRegistration(userData);
  } catch (error) {
    console.error('Registration start error:', error);
    return {
      success: false,
      message: 'Kayıt işlemi başlatılırken hata oluştu'
    };
  }
});

ipcMain.handle('auth-complete-registration', async (event, email, verificationCode) => {
  try {
    return await authService.completeRegistration(email, verificationCode);
  } catch (error) {
    console.error('Registration complete error:', error);
    return {
      success: false,
      message: 'Kayıt tamamlanırken hata oluştu'
    };
  }
});

ipcMain.handle('auth-resend-code', async (event, email) => {
  try {
    return await authService.resendVerificationCode(email);
  } catch (error) {
    console.error('Resend code error:', error);
    return {
      success: false,
      message: 'Kod yeniden gönderilirken hata oluştu'
    };
  }
});

ipcMain.handle('auth-cancel-registration', (event, email) => {
  try {
    return authService.cancelRegistration(email);
  } catch (error) {
    console.error('Cancel registration error:', error);
    return {
      success: false,
      message: 'İptal işleminde hata oluştu'
    };
  }
});

ipcMain.handle('auth-login', async (event, emailOrUsername, password) => {
  try {
    return await authService.login(emailOrUsername, password);
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Giriş yapılırken hata oluştu'
    };
  }
});

ipcMain.handle('auth-get-user-info', async (event, userId) => {
  try {
    return await authService.getUserInfo(userId);
  } catch (error) {
    console.error('Get user info error:', error);
    return null;
  }
});

// Password Reset IPC Handlers
ipcMain.handle('auth-send-reset-code', async (event, email) => {
  try {
    return await authService.sendPasswordResetCode(email);
  } catch (error) {
    console.error('Send reset code error:', error);
    return {
      success: false,
      message: 'Kod gönderilirken hata oluştu'
    };
  }
});

ipcMain.handle('auth-verify-reset-code', async (event, email, code) => {
  try {
    return await authService.verifyPasswordResetCode(email, code);
  } catch (error) {
    console.error('Verify reset code error:', error);
    return {
      success: false,
      message: 'Kod doğrulama sırasında hata oluştu'
    };
  }
});

ipcMain.handle('auth-reset-password', async (event, email, newPassword) => {
  try {
    return await authService.resetPassword(email, newPassword);
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      message: 'Şifre değiştirme sırasında hata oluştu'
    };
  }
});

ipcMain.handle('auth-cancel-password-reset', (event, email) => {
  try {
    return authService.cancelPasswordReset(email);
  } catch (error) {
    console.error('Cancel password reset error:', error);
    return {
      success: false,
      message: 'İptal işlemi sırasında hata oluştu'
    };
  }
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// Uygulama başlatma
app.whenReady().then(() => {
  createLoadingWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createLoadingWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Güvenlik: Yeni pencere oluşturmayı engelle
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});
