import React, {
  useEffect,
  createContext,
  useContext,
  useState,
  useRef
} from 'react'
import Helmet from 'react-helmet'
import { useThemeSwitcher } from './css-theme-switcher'

import themesConfig from '../../dist/themes/themes.json'
import { useThemeService } from '../services/theme'
import { plugin } from '../../egraze'

export const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

const themes = themesConfig.themes.reduce(
  (result, theme) => ({
    ...result,
    ...theme.variants.reduce(
      (vs, variant) => ({
        ...vs,
        [variant.name]: {
          ...variant,
          staticUrl: `static://themes/${variant.css}`
        }
      }),
      {}
    )
  }),
  {}
)

export { themes }

export const DjitsuTheme = props => {
  const themePlugin = plugin('theme')
  const pluginContext = useContext(themePlugin.Context)
  const { actions: themeActions } = useThemeService()
  const { switcher } = useThemeSwitcher()
  const [isDark, setIsDark] = useState(false)

  const themeRef = useRef('')
  const [themeInStore, setThemeInStore] = useState(
    pluginContext.theme || 'djitsu-light-theme'
  )
  const [activation] = useState()

  useEffect(() => {
    if (themeInStore && availableThemes.length) {
      themeRef.current = themeInStore
      switcher({ theme: themes[themeInStore] })
      const dark = availableThemes.find(({ name }) => name === themeInStore)
        ?.dark
      props.onTypeChange?.(dark ? 'dark' : 'light')
      setIsDark(!!dark)
      themeActions.setState(v => ({
        ...v,
        theme: themeInStore,
        darkMode: !!dark
      }))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeInStore, availableThemes])

  useEffect(() => {
    if (activation) {
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      const prefersDark = mql.matches

      if (prefersDark) {
        setThemeInStore('djitsu-dark-theme')
      } else if (!prefersDark) {
        setThemeInStore('djitsu-light-theme')
      }
      props.onChange?.(prefersDark ? 'djitsu-dark-theme' : 'djitsu-light-theme')

      const onChangeMql = e => {
        const darkModeOn = e.matches
        if (darkModeOn) {
          setThemeInStore('djitsu-dark-theme')
        } else if (!darkModeOn) {
          setThemeInStore('djitsu-light-theme')
        }
        props.onChange?.(
          prefersDark ? 'djitsu-dark-theme' : 'djitsu-light-theme'
        )
      }
      mql.addEventListener('change', onChangeMql)

      return () => {
        mql.removeEventListener('change', onChangeMql)
      }
    }
    return () => {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activation])

  const [availableThemes, setAvailableThemes] = useState([])

  useEffect(() => {
    setAvailableThemes(Object.values(themes))
  }, [])

  const state = {
    theme: themeInStore,
    isDark,
    activation,
    availableThemes
  }

  const actions = {
    setActivation: () => {
      // userActions.setOption('theme-activation', on)
    },
    switchTheme: () => {
      setThemeInStore(
        themeInStore === 'djitsu-dark-theme'
          ? 'djitsu-light-theme'
          : 'djitsu-dark-theme'
      )
      props.onChange?.(
        themeInStore !== 'djitsu-dark-theme'
          ? 'djitsu-dark-theme'
          : 'djitsu-light-theme'
      )
    },
    setTheme: theme => {
      setThemeInStore(theme)
    },
    saveTheme: async (theme, darkMode) => {
      themeActions.saveTheme(theme, darkMode)
      return true
    },
    getTheme: () => themeRef.current,
    getThemes: type =>
      type
        ? availableThemes.filter(({ isDark }) => isDark === (type === 'dark'))
        : availableThemes
  }
  const context = [state, actions]

  return (
    <ThemeContext.Provider value={context}>
      <div className={`djs-theme ${themeInStore}`}>
        <Helmet>
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap"
            rel="stylesheet"
          />
        </Helmet>
        {props.children}
      </div>
    </ThemeContext.Provider>
  )
}

export default DjitsuTheme
