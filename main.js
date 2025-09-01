// const { app, BrowserWindow } = require('electron');
// const { autoUpdater } = require('electron-updater');

// let win;

// function createWindow() {
//   win = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false,
//     },
//   });

//   win.loadFile('index.html');
// }

// // Run when app is ready
// app.whenReady().then(() => {
//   createWindow();

//   // 🔑 Check for updates
//   autoUpdater.checkForUpdatesAndNotify();
// });

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') app.quit();
// });

// app.on('activate', () => {
//   if (BrowserWindow.getAllWindows().length === 0) createWindow();
// });


const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');

let win;

// Configure auto-updater (optional settings)
autoUpdater.autoDownload = false; // Don't auto-download, ask user first
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('index.html');
}

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version);
  
  // Show dialog to user
  dialog.showMessageBox(win, {
    type: 'info',
    title: 'Update Available',
    message: `A new version (${info.version}) is available!`,
    detail: 'Would you like to download and install it now?',
    buttons: ['Download Now', 'Later'],
    defaultId: 0
  }).then((result) => {
    if (result.response === 0) {
      // User clicked "Download Now"
      autoUpdater.downloadUpdate();
      
      // Show downloading dialog
      dialog.showMessageBox(win, {
        type: 'info',
        title: 'Downloading Update',
        message: 'Update is downloading in the background...',
        detail: 'You\'ll be notified when it\'s ready to install.',
        buttons: ['OK']
      });
    }
  });
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.');
});

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater:', err);
  dialog.showErrorBox('Update Error', 'An error occurred while checking for updates.');
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
  
  // Ask user to restart and install
  dialog.showMessageBox(win, {
    type: 'info',
    title: 'Update Ready',
    message: 'Update has been downloaded successfully!',
    detail: 'The application will restart to apply the update.',
    buttons: ['Restart Now', 'Restart Later'],
    defaultId: 0
  }).then((result) => {
    if (result.response === 0) {
      // User clicked "Restart Now"
      autoUpdater.quitAndInstall();
    }
  });
});

// Run when app is ready
app.whenReady().then(() => {
  createWindow();

  // 🔑 Check for updates after a short delay
  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 3000); // Wait 3 seconds after app starts
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Optional: Add menu item to manually check for updates
const { Menu } = require('electron');

const template = [
  {
    label: 'Help',
    submenu: [
      {
        label: 'Check for Updates',
        click() {
          autoUpdater.checkForUpdates();
        }
      },
      {
        label: 'About',
        click() {
          dialog.showMessageBox(win, {
            type: 'info',
            title: 'About',
            message: 'Your App Name',
            detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}`
          });
        }
      }
    ]
  }
];

app.whenReady().then(() => {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});