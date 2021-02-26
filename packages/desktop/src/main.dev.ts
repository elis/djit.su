/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog, nativeTheme, session } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import commander from 'commander'

const local: Record<string, unknown> = {
}
export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../resources');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1280,
    height: 728,
    icon: getAssetPath('icon.png'),
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      devTools: true,
      nodeIntegration: true
    },
  });

  // const session = mainWindow.webContents.session
  session.defaultSession.protocol.registerFileProtocol('static', (request, callback) => {
    const fileUrl = request.url.replace('static://', '');
    const filePath = path.join(app.getAppPath(), 'dist', fileUrl);
    callback(filePath);
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  ipcMain.handle('get-file-selection', async (event, ...args) => {
    // ... do actions on behalf of the Renderer
    console.log('files read', {event, args})
    if (!mainWindow) return {error: 'no window'}
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'openDirectory']
    })
    console.log('result of dialogxxx:', result)
    return {
      result,
      cwd: process.cwd(),
      processexecArgv: process.execArgv,
      execPath: process.execPath,
      argv: process.argv, local, exec: app.getPath('exe'), appPath: app.getAppPath() }
  })
  ipcMain.handle('open-dev-tools', () => {
    // ... do actions on behalf of the Renderer
    if (!mainWindow) return {error: 'no window'}
    mainWindow.webContents.openDevTools()
    return
  })

  ipcMain.handle('read-files', async (event, ...args) => {
    // ... do actions on behalf of the Renderer

    console.log('files read', {event, args})
    return {q: 'vc'}
  })

  ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light'
    } else {
      nativeTheme.themeSource = 'dark'
    }
    return nativeTheme.shouldUseDarkColors
  })
  ipcMain.handle('dark-mode:set', (_event, on) => {
    if (!on) {
      nativeTheme.themeSource = 'light'
    } else {
      nativeTheme.themeSource = 'dark'
    }
    return nativeTheme.shouldUseDarkColors
  })

  ipcMain.handle('dark-mode:system', () => {
    nativeTheme.themeSource = 'system'
  })
  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

app.on('second-instance', (_event, argv, cwd) => {
  local.second = {
    argv, cwd
  }
})
app.on('open-file', (_event, path) => {
  local.third = {
    path
  }
})
app.on('ready', (_event, info) => {
  local.ready = {
    info
  }
})

commander
  .name('djitsu')
  .version('1.2.3')
  .addOption(
    new commander.Option('-v, --voice <voice>', 'Select voice')
  )
  .description(
    'Working example'
  )
  .addHelpText('after', 'Up')
  .action((options) => {
    local.options = options
    app.whenReady().then(createWindow).catch(console.log);

  })
commander.parse(process.argv)
