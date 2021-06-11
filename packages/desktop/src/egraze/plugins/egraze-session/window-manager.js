import path from 'path'
import { BrowserWindow, ipcMain, session, shell } from 'electron'
import MenuBuilder from './menu'
import AppUpdater from './app-updater'

export default function WindowManager (app, config) {
  const { dirname } = config
  const state = {
    windows: []
  }


  const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'resources')
  : path.join(dirname, '../resources')

  const getAssetPath = (...paths) => path.join(RESOURCES_PATH, ...paths)

  const createWindow = async (options) => {
    const id = Date.now().toString(32)
    const isMain = !state.windows.length
    const { context = {} } = options || {}

    const windowOptions = {
      show: false,
      width: options?.width || 1280,
      height: options?.height || 728,
      icon: getAssetPath('icon.png'),
      frame: false,
      titleBarStyle: 'hidden',
      webPreferences: {
        devTools: true,
        contextIsolation: false,
        contextIsolationInWorker: false,
        nodeIntegration: true,
        nodeIntegrationInWorker: true
      }
    }

    const window = {
      context,
      id,
      isMain,
      windowOptions
    }

    if (
      !state.initializedDebug &&
      (process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true')
    ) {
      await installExtensions()
      await installFiles()
      state.initializedDebug = true
    }
    if (!state.intialized) {
      installProtocol(app)
      configureDefaultSession(app)
      state.intialized = true
    }

    window.window = new BrowserWindow(windowOptions)

    registerWindowHandlers(window)

    if (isMain) {
      // TODO: Update menu on new windows
      const menuBuilder = state.menu = new MenuBuilder(window.window)
      menuBuilder.buildMenu()

      state.mainWindow = window

      // eslint-disable-next-line no-new
      new AppUpdater()
    }

    window.window.loadURL(`file://${dirname}/index.html?id=${window.id}`)

    state.windows.push(window)
    return window
  }

  const registerWindowHandlers = (window) => {
    // @TODO: Use 'ready-to-show' event - meh, potentially.
    //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
    window.window.webContents.on('did-finish-load', () => {
      if (!window.window) {
        throw new Error('"window.window" is not defined')
      }
      window.window.webContents.closeDevTools()

      if (process.env.START_MINIMIZED) {
        window.window.minimize()
      } else {
        window.window.show()
        window.window.focus()
      }
    })

    // Open urls in the user's browser
    window.window.webContents.on('new-window', (event, url) => {
      event.preventDefault()
      shell.openExternal(url)
    })

    window.window.on('closed', () => {
      window.window = null
      state.windows = state.windows.filter(({ id }) => id !== window.id)
      if (window.isMain)
        // Pick last focused window as mainWIndow
        state.mainWindow = state.windows.sort((a, b) => a.lastFocus < b.lastFocus ? 1 : -1)[0]
    })

    window.window.on('browser-window-focus', () => {
      window.lastFocus = Date.now()
    })
    window.window.on('browser-window-blur', () => {
      window.lastBlur = Date.now()
    })
  }

  return {
    getMainWindow: () => state.mainWindow,
    getWindows: () => state.windows,
    createWindow
  }
}


const installExtensions = async () => {
  const installer = require('electron-devtools-installer')
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS
  const extensions = ['REACT_DEVELOPER_TOOLS']

  return installer
    .default(
      extensions.map(name => installer[name]),
      forceDownload
    )
    .catch(console.log)
}

const installFiles = async () => {
  const { ProgId, ShellOption, Regedit } = require('electron-regedit')

  // eslint-disable-next-line no-new
  new ProgId({
    description: 'Djitsu Test',
    extensions: ['djot'],
    shell: [
      new ShellOption({ verb: ShellOption.OPEN }),
      new ShellOption({ verb: ShellOption.EDIT, args: ['--edit'] }),
      new ShellOption({ verb: ShellOption.PRINT, args: ['--print'] })
    ]
  })

  Regedit.installAll()
  console.log('Extensions ready!')
}

const configureDefaultSession = (app) => {
  session.defaultSession.protocol.registerFileProtocol(
    'static',
    (request, callback) => {
      const fileUrl = request.url.replace('static://', '')
      const filePath = path.join(app.getAppPath(), 'dist', fileUrl)
      callback(filePath)
    }
  )
}

const installProtocol = (app) => {
  app.setAsDefaultProtocolClient('djitsu')
}
