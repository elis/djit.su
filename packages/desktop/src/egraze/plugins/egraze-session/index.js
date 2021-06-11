import { ipcMain, nativeTheme } from 'electron'

import Messaging from './messaging'
import WindowManager from './window-manager'

export const name = 'session'

export const main = {
  init: (options, fields, app, config) => {
    const local = {}

    const wm = new WindowManager(app, { ...config, local })
    const messaging = new Messaging(app, wm, { ...config, local })

    const makeWindow = wm.createWindow

    const onActivate = async () => {
      console.log(
        '[==] Window onActivate',
        JSON.stringify(wm.getMainWindow() || {}).substr(0, 60)
      )
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (!wm.getMainWindow())
        wm.createWindow({
          context: {
            action: 'new-window'
          }
        })
    }

    const onReady = (_event, info) => {
      local.info = info
    }

    const onOpenFile = async (_event, path) => {
      console.log('[==] Open File', path)

      wm.createWindow({
        context: {
          action: 'open-file',
          payload: { path }
        }
      })
    }

    const onOpenUrl = async (_event, path, ...rest) => {
      console.log('[==] Open URL', path, rest)

      wm.createWindow({
        context: {
          action: 'open-url',
          payload: { path, rest }
        }
      })
    }

    const onSecondInstance = async (_event, argv, cwd) => {
      console.log('[==] Second Instance', argv, cwd)

      if (!wm.getMainWindow())
        wm.createWindow({
          context: {
            action: 'second-instance',
            payload: { argv, cwd }
          }
        })
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
    app.on('open-url', onOpenUrl)
    app.on('second-instance', onSecondInstance)
    app.on('window-all-closed', onWindowAllClosed)

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
    fields.makeWindow({
      context: {
        action: 'initial'
      }
    })
  }
}
