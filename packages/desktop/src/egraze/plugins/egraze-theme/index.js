import React from 'react'
import { ipcMain, ipcRenderer, nativeTheme } from 'electron'
import { plugin } from '../..'
import { themes } from '../../../djitsu/theme'
import { ThemeSwitcherProvider } from '../../../djitsu/theme/css-theme-switcher'
import {
  ThemePluginAction,
  ThemePluginChannel
} from '../../../djitsu/schema/theme'

export const name = 'theme'

export const defaultTheme = {
  darkTheme: 'djitsu-dark-theme',
  lightTheme: 'djitsu-light-theme',
  theme: 'djitsu-dark-theme',
  isDark: true
}

export const main = {
  init: () => {
    const userSettings = plugin('user-settings')
    const darkMode = {
      set: source => {
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

    // ! NEW STUFF

    ipcMain.handle(ThemePluginChannel, (event, action, payload) => {
      if (action === ThemePluginAction.GET_THEME) {
        const themeData = userSettings.get('theme') || defaultTheme
        return themeData
      }
      if (action === ThemePluginAction.SET_THEME) {
        userSettings.set('theme', v => ({
          ...(v || {}),
          theme: payload.theme,
          isDark: payload.isDark
        }))
      }
      return null
    })

    return {
      isDarkMode: () => nativeTheme.shouldUseDarkColors,
      onDarkModeChange: callback => {
        nativeTheme.on('updated', () =>
          callback(nativeTheme.shouldUseDarkColors)
        )
      },
      darkMode
    }
  }
}

export const renderer = {
  init: (...args) => {
    const api = {
      setDarkMode: isDark => {
        console.log('SET DARK MODE', isDark)
        // ipcRenderer.invoke('plugin:theme', 'test-action', { isDark })
      },
      getTheme: async () => {
        const result = await ipcRenderer.invoke(
          ThemePluginChannel,
          ThemePluginAction.GET_THEME
        )
        return result
      },
      setTheme: async (theme, isDark) => {
        const result = await ipcRenderer.invoke(
          ThemePluginChannel,
          ThemePluginAction.SET_THEME,
          { theme, isDark }
        )
        return result
      },
      Context: React.createContext({})
    }

    return api
  },
  onLoad: async (App, fields) => {
    const themeData = await fields.getTheme()
    const AppWrapper = () => (
      <fields.Context.Provider value={themeData}>
        <ThemeSwitcherProvider defaultTheme={themeData.theme} themeMap={themes}>
          <App />
        </ThemeSwitcherProvider>
      </fields.Context.Provider>
    )
    fields.themeData = themeData

    return AppWrapper
  }
}
