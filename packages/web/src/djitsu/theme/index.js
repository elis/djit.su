import React, {
  useEffect,
  createContext,
  useContext,
  useState,
  useRef
} from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { useUser } from 'djitsu/providers/user'
import { useThemeSwitcher } from './css-theme-switcher'

const ThemeContext = createContext([{ theme: 'light' }, {}])

export const useTheme = () => useContext(ThemeContext)

export const DjitsuTheme = (props) => {
  const { switcher, themes, currentTheme } = useThemeSwitcher()
  const [user, userActions] = useUser()
  const themeRef = useRef()
  const [themeInStore, setThemeInStore] = useState(props.theme || 'light')
  const [activation, _setActivation] = useState(
    user?.options?.['theme-activation'] ?? true
  )

  const setBodyClass = (bodyClass) => {
    document?.body?.classList.add(bodyClass === 'dark' ? 'dark' : 'light')
    document?.body?.classList.remove(bodyClass !== 'dark' ? 'dark' : 'light')
  }
  const setBodyTheme = (theme) => {
    document.body.attributes
  }
  const onLight = async () => {
    // logEvent('set_theme', { theme: 'light' })
    // await import('./themes/light.less')
    // setProperty('theme', 'light')
    setBodyClass('light')
    switcher('djitsu-light-theme')
  }
  const onDark = async () => {
    // logEvent('set_theme', { theme: 'dark' })
    // await import('./themes/dark.less')
    // setProperty('theme', 'dark')
    setBodyClass('dark')
    switcher('djitsu-dark-theme')
  }

  useEffect(() => {
    themeRef.current = themeInStore
    if (themeInStore === 'dark') onDark()
    else onLight()
  }, [themeInStore])

  useEffect(() => {
    if (user?.options?.['theme-activation'] !== activation) {
      _setActivation(user?.options?.['theme-activation'])
    }
  }, [user, activation])

  useEffect(() => {
    if (user?.currentUsername && activation) {
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      const prefersDark = mql.matches

      if (prefersDark) {
        setThemeInStore('dark')
      } else if (!prefersDark) {
        setThemeInStore('light')
      }
      props.onChange?.(prefersDark ? 'dark' : 'light')

      const onChangeMql = (e) => {
        const darkModeOn = e.matches
        if (darkModeOn) {
          setThemeInStore('dark')
        } else if (!darkModeOn) {
          setThemeInStore('light')
        }
        props.onChange?.(prefersDark ? 'dark' : 'light')
      }
      mql.addEventListener('change', onChangeMql)

      return () => {
        mql.removeEventListener('change', onChangeMql)
      }
    }
  }, [activation])

  const state = {
    theme: themeInStore,
    themes,
    activation
  }

  const actions = {
    setVariant: (variantName) => {
      console.log('🌸🌼 Variant saving:', variantName)
    },

    setActivation: (on) => {
      userActions.setOption('theme-activation', on)
    },
    switchTheme: () => {
      setThemeInStore(themeInStore === 'dark' ? 'light' : 'dark')
      props.onChange?.(themeInStore !== 'dark' ? 'dark' : 'light')
    },
    getTheme: () => themeRef.current
  }
  const context = [state, actions]

  return (
    <ThemeContext.Provider value={context}>
      <div
        className={'djs-theme ' + themeInStore}
        data-djitsu-theme={currentTheme}
      >
        <Helmet>
          <link
            href='https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap'
            rel='stylesheet'
          />
        </Helmet>
        {props.children}
      </div>
    </ThemeContext.Provider>
  )
}

DjitsuTheme.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.node)
  ])
}

export default DjitsuTheme
