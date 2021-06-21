import { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { plugin } from '../../egraze'
import { themeState } from '../state/atoms/theme'

export const ThemeService = () => {
  const [state] = useRecoilState(themeState)

  useEffect(() => {
    const themePlugin = plugin('theme')
    themePlugin.setDarkMode(state.darkMode)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.theme])

  return null
}

export const useThemeService = () => useRecoilState(themeState)
