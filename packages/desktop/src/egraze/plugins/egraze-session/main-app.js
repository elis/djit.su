import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import path from 'path'

import { BrowserWindow, session, shell } from 'electron'
import MenuBuilder from '../../../menu'

let mainWindow = null

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info'
    autoUpdater.logger = log
    autoUpdater.checkForUpdatesAndNotify()
  }
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')()
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

export const createWindow = async (app, config) => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions()
    await installFiles()
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../resources')

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths)
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1280,
    height: 728,
    icon: getAssetPath('icon.png'),
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      nodeIntegrationInWorker: true
    }
  })

  // const session = mainWindow.webContents.session
  session.defaultSession.protocol.registerFileProtocol(
    'static',
    (request, callback) => {
      const fileUrl = request.url.replace('static://', '')
      const filePath = path.join(app.getAppPath(), 'dist', fileUrl)
      callback(filePath)
    }
  )

  mainWindow.loadURL(`file://${config.dirname}/index.html`)

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined')
    }

    if (process.env.START_MINIMIZED) {
      mainWindow.minimize()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const menuBuilder = new MenuBuilder(mainWindow)
  menuBuilder.buildMenu()

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

}
