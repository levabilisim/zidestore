const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

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
