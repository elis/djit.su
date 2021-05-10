import { ipcMain, nativeTheme } from 'electron'
import { plugin } from '../..'

export const main = {
  init: () => {
    const darkMode = {
      set: source => {
        const userSettings = plugin('user-settings')
        console.log('🗺🚏 Setting theme!', { userSettings })
        nativeTheme.themeSource = source
      },
      get: () => nativeTheme.shouldUseDarkColors,
      toggle: () => darkMode.set(darkMode.get() ? 'light' : 'dark'),
      useSystem: () => darkMode.set('system')
    }

    ipcMain.handle('dark-mode:toggle', () => darkMode.toggle())
    ipcMain.handle('dark-mode:set', (dark = false) =>
      darkMode.set(dark ? 'dark' : 'light')
    )
    ipcMain.handle('dark-mode:system', () => darkMode.useSystem())

    return {
      darkMode
    }
  }
}

export const renderer = {
  init: (...args) => {
    console.log('INITIALIZING EGRAZE THEME RENDERER PLUGIN', args)
  }
}
