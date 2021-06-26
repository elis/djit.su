export type ThemeState = {
  theme: string
  darkMode: boolean
}

export const ThemePluginChannel = 'plugin:theme'

export enum ThemePluginAction {
  GET_THEME = 'get-theme',
  SET_THEME = 'set-theme'
}

export type ThemeServiceApi = {
  setState: (newState: Partial<ThemeState>) => Promise<ThemeState>
}
