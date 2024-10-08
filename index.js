import { app, globalShortcut, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();

let win;
let isDraggable = false;

function createWindow() {
  const defaultBounds = { x: 100, y: 100 };
  const savedBounds = store.get('windowBounds', defaultBounds);

  win = new BrowserWindow({
    ...savedBounds,
    width: 300,
    height: 80,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  win.setIgnoreMouseEvents(true, { forward: true });
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setAlwaysOnTop(true, 'screen-saver', 1);
  win.setBackgroundColor('rgba(0, 0, 0, 0)');
  win.loadFile('index.html');

  win.on('move', () => {
    const bounds = win.getBounds();
    store.set('windowBounds', bounds);
  });
}

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register('Control+Alt+Right', () => {
    win.webContents.send('switch-theme', 'next');
  });

  globalShortcut.register('Control+Alt+Left', () => {
    win.webContents.send('switch-theme', 'previous');
  });

  globalShortcut.register('Control+Alt+R', () => {
    win.setPosition(100, 100);
  });

  globalShortcut.register('Control+Alt+X', () => {
    isDraggable = !isDraggable;
    win.webContents.send('toggle-drag', isDraggable);

    if (isDraggable) {
      win.setIgnoreMouseEvents(false);
    } else {
      win.setIgnoreMouseEvents(true, { forward: true });
    }
  });

  globalShortcut.register('Control+Alt+Shift+C', () => {
    win.close();
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('get-env-variables', (event) => {
  event.sender.send('env-variables', {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: `http://localhost:8888/callback`,
  });
});

ipcMain.on('spotify-authenticate', async (event, authUrl) => {
  try {
    const { default: open } = await import('open');
    await open(authUrl);
  } catch (error) {
    console.error('Error opening Spotify auth URL:', error);
  }
});
