import path from 'path'
import { ipcMain } from 'electron'
import YAML from 'yaml'

const initialied = {}

export default function Messaging(app, wm, config) {
  console.log('Messaging Initialized!!')
  const onBootup = (event, windowId, ...args) => {
    console.log('Bootup received!!', windowId)
    const window = wm.getWindows().find(({ id }) => id === windowId)
    return {
      staticPath: `file://${config.dirname}/`,
      local: {
        ...(config.local || {}),
        ...(window.context || {})
      }
    }
  }

  const onSavePaneWidth = async (event, newWidth) => {
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
  }

  const onGetPaneWidth = async event => {
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
  }

  const onOpenDevTools = (event, windowId) => {
    console.log('[==] Open dev tools', windowId)
    // ... do actions on behalf of the Renderer

    const window = windowId
      ? wm.getWindows().find(({ id }) => id === windowId)
      : wm.getMainWindow()

    console.log('[==] Open dev tools for window', window)

    window?.window.webContents.openDevTools({
      mode: 'right'
    })
  }

  const onGetLocal = (event, windowId) => {
    console.log('Get local by windowId:', windowId)
    return config.local
  }

  ipcMain.handle('bootup', onBootup)
  ipcMain.handle('save-pane-width', onSavePaneWidth)
  ipcMain.handle('get-pane-width', onGetPaneWidth)
  ipcMain.handle('open-dev-tools', onOpenDevTools)
  ipcMain.handle('get-local', onGetLocal)

  return {}
}
