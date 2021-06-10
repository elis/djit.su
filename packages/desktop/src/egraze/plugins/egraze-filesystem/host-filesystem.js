import { dialog, ipcMain } from 'electron'
import fs from 'fs'
import { plugin } from '../../index'

const { readFile, writeFile } = fs.promises

const bindLocalFilesystem = (app, config) => {

  const onGetFileSelection = async (event, ...args) => {
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
  }

  const onReadFiles = async (event, ...args) => {
    // ... do actions on behalf of the Renderer

    console.log('files read', { event, args })
    return { q: 'vc' }
  }

  const onReadFile = async (event, filepath) =>
    readFile(filepath, { encoding: 'utf-8' })

  const onWriteFile = async (event, filepath, filedata) =>
    writeFile(filepath, filedata)

  ipcMain.handle('get-file-selection', onGetFileSelection)

  ipcMain.handle('read-files', onReadFiles)

  ipcMain.handle('read-file', onReadFile)

  ipcMain.handle('write-file', onWriteFile)

  return {
    dev: {
      onGetFileSelection,
      onReadFiles,
      onReadFile,
      onWriteFile
    }
  }
}

export default bindLocalFilesystem
