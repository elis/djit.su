import { dialog, ipcMain } from 'electron'
import fs from 'fs'
import { plugin } from '../../index'

const { readFile, writeFile } = fs.promises

const bindLocalFilesystem = (app, config) => {
  app.on('open-file', (_event, path) => {
    const session = plugin('session')

    console.log('[==] Open File', path)
    session.local.third = {
      path
    }
    if (session.mainWindow === null) session.createWindow()
  })

  ipcMain.handle('get-file-selection', async (event, ...args) => {
    const session = plugin('session')

    // ... do actions on behalf of the Renderer
    console.log('files read', { event, args })
    if (!session.mainWindow) return { error: 'no window' }
    const result = await dialog.showOpenDialog(session.mainWindow, {
      properties: ['openFile', 'openDirectory']
    })
    console.log('result of dialogxxx:', result)
    return {
      result,
      cwd: process.cwd(),
      processexecArgv: process.execArgv,
      execPath: process.execPath,
      argv: process.argv,
      local: session.local,
      exec: app.getPath('exe'),
      appPath: app.getAppPath()
    }
  })

  ipcMain.handle('read-files', async (event, ...args) => {
    // ... do actions on behalf of the Renderer

    console.log('files read', { event, args })
    return { q: 'vc' }
  })

  ipcMain.handle('read-file', async (event, filepath) =>
    readFile(filepath, { encoding: 'utf-8' })
  )

  ipcMain.handle('write-file', async (event, filepath, filedata) =>
    writeFile(filepath, filedata)
  )
}

export default bindLocalFilesystem
