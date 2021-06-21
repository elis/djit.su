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
import { ThemeService, useThemeService } from '../services/theme'
import { plugin } from '../../egraze'

type ThemeContextTuple = [ThemeContextState, ThemeContextActions]
interface ThemeContextState {
  activation?: boolean
  isDark?: boolean
  theme: string
  availableThemes: ThemeOption[]
}
interface ThemeContextActions {
  setActivation: (automatic: boolean) => void
  switchTheme: () => void
  setTheme: (theme: string) => void
  getTheme: () => string | void
  getThemes: (type?: 'light' | 'dark') => ThemeOption[] | void
}

type ThemeOption = {
  name: string
  dark: boolean
}

const ThemeContext = createContext<ThemeContextTuple>([
  {
    theme: 'djitsu-light-theme',
    availableThemes: []
  },
  {
    setActivation: () => console.error('no theme context provided'),
    switchTheme: () => console.error('no theme context provided'),
    setTheme: () => console.error('no theme context provided'),
    getTheme: () => console.error('no theme context provided'),
    getThemes: () => console.error('no theme context provided')
  }
])

export const useTheme = () => useContext(ThemeContext)

const themes = Object.entries(themesConfig)
  .map(([name, pub]) => [name, `static://${pub}`])
  .reduce((acc, [name, pub]) => ({ ...acc, [name]: pub }), {})

export { themes }
interface DjitsuThemeProps {
  theme?: string
  onChange?: (theme: string) => void
  onTypeChange?: (type: 'light' | 'dark') => void
}

export const DjitsuTheme: React.FC<DjitsuThemeProps> = props => {
  const themePlugin = plugin('theme')
  const pluginContext = useContext(themePlugin.Context)
  console.log('Plugin context value:', pluginContext)
  // const [user, userActions] = useUser()
  const [, setThemeService] = useThemeService()
  const { switcher, themes } = useThemeSwitcher()
  const [isDark, setIsDark] = useState(false)

  const themeRef = useRef('')
  const [themeInStore, setThemeInStore] = useState(
    props.theme || 'djitsu-light-theme'
  )
  const [activation] = useState()
  // user?.options?.['theme-activation'] ?? true

  useEffect(() => {
    themeRef.current = themeInStore

    switcher({ theme: themes[themeInStore] })
    const dark = availableThemes.find(({ name }) => name === themeInStore)?.dark
    props.onTypeChange?.(dark ? 'dark' : 'light')
    setIsDark(!!dark)
    setThemeService(v => ({
      ...v,
      theme: themeInStore,
      darkMode: !!dark
    }))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeInStore])

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

      const onChangeMql = (e: MediaQueryListEvent) => {
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

  const [availableThemes, setAvailableThemes] = useState<ThemeOption[]>([])

  useEffect(() => {
    ;(async () => {
      const themesData = await Promise.all(
        Object.keys(themes).map(async name => [
          name,
          await import(`./themes/${name}/theme.json`)
        ])
      )
      const parsedData = themesData.map(([name, themeJson]) => ({
        name,
        dark: themeJson.type === 'dark'
      }))
      setAvailableThemes(parsedData)
    })()
  }, [themes])

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
    setTheme: (theme: string) => setThemeInStore(theme),
    getTheme: () => themeRef.current,
    getThemes: (type?: 'light' | 'dark') =>
      type
        ? availableThemes.filter(({ dark }) => dark === (type === 'dark'))
        : availableThemes
  }
  const context: ThemeContextTuple = [state, actions]

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
        <ThemeService />
      </div>
    </ThemeContext.Provider>
  )
}

export default DjitsuTheme
