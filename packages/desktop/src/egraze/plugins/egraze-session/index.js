import { ipcMain, nativeTheme } from 'electron'
import { createWindow } from './main-app'

export const name = 'session'

export const main = {
  init: (options, fields, app, config) => {
    const local = {}

    // local.options = options
    let mainWindow

    const makeWindow = async () => {
      mainWindow = await createWindow(app, { ...config, local })

      mainWindow.on('closed', () => {
        mainWindow = null
      })
    }

    app.on('activate', async () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) mainWindow = await makeWindow()
    })

    app.on('ready', (_event, info) => {
      local.ready = {
        info
      }
    })

    app.on('second-instance', async (_event, argv, cwd) => {
      console.log('[==] Second Instance', argv, cwd)
      local.second = {
        argv,
        cwd
      }
      if (mainWindow === null) mainWindow = await makeWindow()
    })

    app.on('window-all-closed', () => {
      // Respect the OSX convention of having the application in memory even
      // after all windows have been closed
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    ipcMain.handle('dark-mode:system', () => {
      nativeTheme.themeSource = 'system'
    })
    ipcMain.handle('get-local', () => {
      return local
    })

    return {
      makeWindow,
      field: 'test'
    }
  },
  onReady: (options, fields) => {
    console.log('🙎‍♂️ Egraze Session Plugin Ready!', { fields, options })
    fields.makeWindow()
  }
}
