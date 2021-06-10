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

    const onActivate = async () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) mainWindow = await makeWindow()
    }

    const onReady = (_event, info) => {
      local.ready = {
        info
      }
    }

    const onOpenFile =  async (_event, path) => {

      console.log('[==] Open File', path)
      local.third = {
        path
      }
      if (mainWindow === null) mainWindow = await makeWindow()
    }

    const onSecondInstance = async (_event, argv, cwd) => {
      console.log('[==] Second Instance', argv, cwd)
      local.second = {
        argv,
        cwd
      }
      if (mainWindow === null) mainWindow = await makeWindow()
    }

    const onWindowAllClosed = () => {
      // Respect the OSX convention of having the application in memory even
      // after all windows have been closed
      if (process.platform !== 'darwin') {
        app.quit()
      }
    }

    app.on('activate', onActivate)

    app.on('ready', onReady)

    app.on('open-file', onOpenFile)

    app.on('second-instance', onSecondInstance)

    app.on('window-all-closed', onWindowAllClosed)

    ipcMain.handle('get-local', () => {
      return local
    })

    return {
      app,
      makeWindow,
      dev: {
        makeWindow,
        onActivate,
        onOpenFile,
        onReady,
        onSecondInstance,
        onWindowAllClosed
      }
    }
  },
  onReady: (options, fields) => {
    console.log('🙎‍♂️ Egraze Session Plugin Ready!', { fields, options })
    fields.makeWindow()
  }
}
