import { atom } from 'recoil'
import { ThemeState } from '../../schema/theme'

export const themeState = atom({
  key: 'themeState',
  default: {
    ready: false,
    theme: '',
    darkMode: false
  } as ThemeState
})
