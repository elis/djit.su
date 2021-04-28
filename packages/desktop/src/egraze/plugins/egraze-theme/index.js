import { ipcMain, nativeTheme } from 'electron'

export const main = {
  init: () => {
    ipcMain.handle('dark-mode:toggle', () => {
      if (!nativeTheme.shouldUseDarkColors) {
        nativeTheme.themeSource = 'light'
      } else {
        nativeTheme.themeSource = 'dark'
      }
      return nativeTheme.shouldUseDarkColors
    })
    ipcMain.handle('dark-mode:set', (_event, on) => {
      if (!on) {
        nativeTheme.themeSource = 'light'
      } else {
        nativeTheme.themeSource = 'dark'
      }
      return nativeTheme.shouldUseDarkColors
    })

    ipcMain.handle('dark-mode:system', () => {
      nativeTheme.themeSource = 'system'
    })
  }
}
