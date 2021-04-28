/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import path from 'path'
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  nativeTheme,
  session
} from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import commander from 'commander'
import YAML from 'yaml'
import AppUpdater from './egraze/plugins/egraze-session/main-app'
import MenuBuilder from './menu'

import initEgraze from './egraze'

import mainProcessInit from './main-process'

const { readFile, writeFile } = require('fs').promises

const local: Record<string, unknown> = {}
export default AppUpdater

let mainWindow: BrowserWindow | null = null

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
    extensions: ['djitsux'],
    shell: [
      new ShellOption({ verb: ShellOption.OPEN }),
      new ShellOption({ verb: ShellOption.EDIT, args: ['--edit'] }),
      new ShellOption({ verb: ShellOption.PRINT, args: ['--print'] })
    ]
  })

  Regedit.installAll()
  console.log('Extensions ready!')
}

const createWindow = async () => {
  // if (
  //   process.env.NODE_ENV === 'development' ||
  //   process.env.DEBUG_PROD === 'true'
  // ) {
  //   await installExtensions()
  //   await installFiles()
  // }

  // const RESOURCES_PATH = app.isPackaged
  //   ? path.join(process.resourcesPath, 'resources')
  //   : path.join(__dirname, '../resources')

  // const getAssetPath = (...paths: string[]): string => {
  //   return path.join(RESOURCES_PATH, ...paths)
  // }

  // mainWindow = new BrowserWindow({
  //   show: false,
  //   width: 1280,
  //   height: 728,
  //   icon: getAssetPath('icon.png'),
  //   frame: false,
  //   titleBarStyle: 'hidden',
  //   webPreferences: {
  //     devTools: true,
  //     nodeIntegration: true,
  //     nodeIntegrationInWorker: true
  //   }
  // })

  // // const session = mainWindow.webContents.session
  // session.defaultSession.protocol.registerFileProtocol(
  //   'static',
  //   (request, callback) => {
  //     const fileUrl = request.url.replace('static://', '')
  //     const filePath = path.join(app.getAppPath(), 'dist', fileUrl)
  //     callback(filePath)
  //   }
  // )

  // mainWindow.loadURL(`file://${__dirname}/index.html`)

  // // @TODO: Use 'ready-to-show' event
  // //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  // mainWindow.webContents.on('did-finish-load', () => {
  //   if (!mainWindow) {
  //     throw new Error('"mainWindow" is not defined')
  //   }

  //   if (process.env.START_MINIMIZED) {
  //     mainWindow.minimize()
  //   } else {
  //     mainWindow.show()
  //     mainWindow.focus()
  //   }
  // })

  // mainWindow.on('closed', () => {
  //   mainWindow = null
  // })

  // const menuBuilder = new MenuBuilder(mainWindow)
  // menuBuilder.buildMenu()

  // // Open urls in the user's browser
  // mainWindow.webContents.on('new-window', (event, url) => {
  //   event.preventDefault()
  //   shell.openExternal(url)
  // })

  // ipcMain.handle('bootup', () => {
  //   return { staticPath: `file://${__dirname}/`, local }
  // })

  // ipcMain.handle('get-file-selection', async (event, ...args) => {
  //   // ... do actions on behalf of the Renderer
  //   console.log('files read', { event, args })
  //   if (!mainWindow) return { error: 'no window' }
  //   const result = await dialog.showOpenDialog(mainWindow, {
  //     properties: ['openFile', 'openDirectory']
  //   })
  //   console.log('result of dialogxxx:', result)
  //   return {
  //     result,
  //     cwd: process.cwd(),
  //     processexecArgv: process.execArgv,
  //     execPath: process.execPath,
  //     argv: process.argv,
  //     local,
  //     exec: app.getPath('exe'),
  //     appPath: app.getAppPath()
  //   }
  // })

  // ipcMain.handle('open-dev-tools', () => {
  //   // ... do actions on behalf of the Renderer
  //   if (!mainWindow) return { error: 'no window' }
  //   mainWindow.webContents.openDevTools()
  // })

  // ipcMain.handle('save-pane-width', async (event, newWidth) => {
  //   const { writeFile, readFile } = require('fs').promises
  //   const path = await import('path')
  //   const homedir = (await import('os')).homedir()
  //   const filepath = path.join(homedir, '.djitsurc')
  //   const settings: Record<string, any> = {}
  //   try {
  //     const settingsFile = await readFile(filepath, { encoding: 'utf-8' })
  //     const parsed = YAML.parse(settingsFile)
  //     Object.assign(settings, parsed)
  //   } catch (error) {
  //     console.log('error reading settings', `${error}`)
  //   }

  //   settings.djotPaneWidth = newWidth
  //   const yamld = YAML.stringify(settings)
  //   try {
  //     await writeFile(filepath, yamld)
  //   } catch (error) {
  //     console.log('error writing file:', `${error}`)
  //   }
  // })
  // ipcMain.handle('get-pane-width', async event => {
  //   const { readFile } = require('fs').promises
  //   const path = await import('path')
  //   const homedir = (await import('os')).homedir()
  //   const filepath = path.join(homedir, '.djitsurc')
  //   const settings: Record<string, any> = {}
  //   try {
  //     const settingsFile = await readFile(filepath, { encoding: 'utf-8' })
  //     const parsed = YAML.parse(settingsFile)
  //     Object.assign(settings, parsed)
  //   } catch (error) {
  //     console.log('error reading settings', `${error}`)
  //   }

  //   return settings.djotPaneWidth
  // })

  // ipcMain.handle('read-files', async (event, ...args) => {
  //   // ... do actions on behalf of the Renderer

  //   console.log('files read', { event, args })
  //   return { q: 'vc' }
  // })

  // ipcMain.handle('read-file', async (event, filepath) =>
  //   readFile(filepath, { encoding: 'utf-8' })
  // )
  // ipcMain.handle('write-file', async (event, filepath, filedata) =>
  //   writeFile(filepath, filedata)
  // )

  // ipcMain.handle('dark-mode:toggle', () => {
  //   if (!nativeTheme.shouldUseDarkColors) {
  //     nativeTheme.themeSource = 'light'
  //   } else {
  //     nativeTheme.themeSource = 'dark'
  //   }
  //   return nativeTheme.shouldUseDarkColors
  // })
  // ipcMain.handle('dark-mode:set', (_event, on) => {
  //   if (!on) {
  //     nativeTheme.themeSource = 'light'
  //   } else {
  //     nativeTheme.themeSource = 'dark'
  //   }
  //   return nativeTheme.shouldUseDarkColors
  // })

  // ipcMain.handle('dark-mode:system', () => {
  //   nativeTheme.themeSource = 'system'
  // })
  // ipcMain.handle('get-local', () => {
  //   return local
  // })
  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
}

const launch = async () => {
  const egraze = await initEgraze()
  egraze.init(app, {
    dirname: __dirname
  })
}
launch()
