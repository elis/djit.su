import { useCallback, useContext, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { plugin } from '../../egraze'
import { themeState } from '../state/atoms/theme'

/**
 * Access Theme Service
 * @returns [import('../schema/theme.ts').ThemeState, import('../schema/theme.ts').ThemeServiceApi]
 */
export const useThemeService = () => {
  const [state, setState] = useRecoilState(themeState)

  const themePlugin = plugin('theme')
  const pluginContext = useContext(themePlugin.Context)

  const saveTheme = useCallback(
    async (theme, darkMode) => {
      themePlugin.setTheme(theme, darkMode)
    },
    [themePlugin]
  )

  useEffect(() => {
    if (!state.ready) {
      setState(v => ({ ...v, ready: true }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pluginContext])

  const actions = {
    setState,
    saveTheme
  }

  return { state, actions }
}
