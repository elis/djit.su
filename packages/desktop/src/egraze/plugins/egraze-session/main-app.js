import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import path from 'path'
import YAML from 'yaml'

import { BrowserWindow, ipcMain, session, shell } from 'electron'
import MenuBuilder from '../../../menu'

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
  const { dirname } = config
  let mainWindow = null
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions()
    await installFiles()
  }

  ipcMain.handle('bootup', () => {
    return { staticPath: `file://${config.dirname}/`, local: config.local }
  })

  console.log('\n\n😬💐 DIRNAME CONFIG:', config)

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(dirname, '../resources')

  const getAssetPath = (...paths) => {
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
      contextIsolation: false,
      contextIsolationInWorker: false,
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

  mainWindow.loadURL(`file://${dirname}/index.html`)

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

  const menuBuilder = new MenuBuilder(mainWindow)
  menuBuilder.buildMenu()

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  ipcMain.handle('save-pane-width', async (event, newWidth) => {
    const { writeFile, readFile } = require('fs').promises
    const homedir = (await import('os')).homedir()
    const filepath = path.join(homedir, '.djitsurc')
    const settings = {}
    try {
      const settingsFile = await readFile(filepath, { encoding: 'utf-8' })
      const parsed = YAML.parse(settingsFile)
      Object.assign(settings, parsed)
    } catch (error) {
      console.log('error reading settings', `${error}`)
    }

    settings.djotPaneWidth = newWidth
    const yamld = YAML.stringify(settings)
    try {
      await writeFile(filepath, yamld)
    } catch (error) {
      console.log('error writing file:', `${error}`)
    }
  })

  ipcMain.handle('get-pane-width', async event => {
    const { readFile } = require('fs').promises
    const homedir = (await import('os')).homedir()
    const filepath = path.join(homedir, '.djitsurc')
    const settings = {}
    try {
      const settingsFile = await readFile(filepath, { encoding: 'utf-8' })
      const parsed = YAML.parse(settingsFile)
      Object.assign(settings, parsed)
    } catch (error) {
      console.log('error reading settings', `${error}`)
    }

    return settings.djotPaneWidth
  })

  ipcMain.handle('open-dev-tools', () => {
    // ... do actions on behalf of the Renderer
    if (!mainWindow) return { error: 'no window' }
    mainWindow.webContents.openDevTools()
  })

  // eslint-disable-next-line no-new
  new AppUpdater()

  return mainWindow
}
