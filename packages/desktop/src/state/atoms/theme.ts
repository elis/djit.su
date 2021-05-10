import { atom } from 'recoil'
import { ThemeState } from '../../schema/theme'

export const themeState = atom({
  key: 'themeState',
  default: {
    theme: '',
    darkMode: false
  } as ThemeState
})
