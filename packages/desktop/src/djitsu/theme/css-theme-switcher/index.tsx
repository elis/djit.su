import * as React from 'react'
import {
  findCommentNode,
  arrayToObject,
  createLinkElement,
  isElement
} from './utils'

enum Status {
  idle = 'idle',
  loading = 'loading',
  loaded = 'loaded'
}

interface IThemeSwitcherContext {
  currentTheme: string | undefined
  themes: Record<any, Record<string, any>>
  switcher: ({ theme }: { theme: string }) => void
  status: Status
}

const ThemeSwitcherContext = React.createContext<
  IThemeSwitcherContext | undefined
>(undefined)

interface Props {
  themeMap: Record<any, Record<string, any>>
  children: React.ReactNode
  insertionPoint?: string | HTMLElement | null
  id?: string
  defaultTheme?: string
  attr?: string
}

export function ThemeSwitcherProvider({
  themeMap,
  insertionPoint,
  defaultTheme,
  id = 'current-theme-style',
  attr = 'data-theme',
  ...rest
}: Props) {
  const [status, setStatus] = React.useState<Status>(Status.idle)
  const [currentTheme, setCurrentTheme] = React.useState<string>()

  const insertStyle = React.useCallback(
    (linkElement: HTMLElement): HTMLElement | void => {
      if (insertionPoint || insertionPoint === null) {
        const insertionPointElement = isElement(insertionPoint)
          ? (insertionPoint as HTMLElement)
          : findCommentNode(insertionPoint as string)

        if (!insertionPointElement) {
          console.warn(
            `Insertion point '${insertionPoint}' does not exist. Be sure to add comment on head and that it matches the insertionPoint`
          )
          return document.head.appendChild(linkElement)
        }

        const { parentNode } = insertionPointElement
        if (parentNode) {
          return parentNode.insertBefore(
            linkElement,
            insertionPointElement.nextSibling
          )
        }
      } else {
        return document.head.appendChild(linkElement)
      }
    },
    [insertionPoint]
  )

  const switcher = React.useCallback(
    ({ theme }: { theme: Record<string, any> }) => {
      if (!theme) return

      if (theme.name === currentTheme) return

      if (theme) {
        setStatus(Status.loading)

        const linkElement = createLinkElement({
          type: 'text/css',
          rel: 'stylesheet',
          id: `${id}_temp`,
          href: theme.staticUrl,
          onload: () => {
            setStatus(Status.loaded)
            const previousStyle = document.getElementById(id)
            if (previousStyle) {
              previousStyle.remove()
            }

            const nextStyle = document.getElementById(`${id}_temp`)
            nextStyle?.setAttribute('id', id)
          }
        })

        insertStyle(linkElement)
        setCurrentTheme(theme.name)
      } else {
        return console.warn('Could not find specified theme')
      }

      document.body.setAttribute(attr, theme)
    },
    [themeMap, insertStyle, attr, id, currentTheme]
  )

  React.useEffect(() => {
    if (defaultTheme) {
      switcher({ theme: defaultTheme })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTheme])

  React.useEffect(() => {
    const themes = Object.keys(themeMap)

    themes.map(theme => {
      const themeAssetId = `theme-prefetch-${theme.name}`
      if (!document.getElementById(themeAssetId)) {
        const stylePrefetch = document.createElement('link')
        stylePrefetch.rel = 'prefetch'
        stylePrefetch.type = 'text/css'
        stylePrefetch.id = themeAssetId
        stylePrefetch.href = themeMap[theme].staticUrl

        insertStyle(stylePrefetch)
      }
      return ''
    })
  }, [themeMap, insertStyle])

  const value = React.useMemo(
    () => ({
      switcher,
      status,
      currentTheme,
      themes: arrayToObject(Object.keys(themeMap))
    }),
    [switcher, status, currentTheme, themeMap]
  )

  return <ThemeSwitcherContext.Provider value={value} {...rest} />
}

export function useThemeSwitcher() {
  const context = React.useContext(ThemeSwitcherContext)
  if (!context) {
    throw new Error(
      'To use `useThemeSwitcher`, component must be within a ThemeSwitcherProvider'
    )
  }
  return context
}
