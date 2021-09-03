import * as React from 'react'
import { findCommentNode, createLinkElement, isElement } from './utils'
import { ProcessedVariant } from '../../../../scripts/themes/compile-themes'

enum Status {
  idle = 'idle',
  loading = 'loading',
  loaded = 'loaded'
}

interface IThemeSwitcherContext {
  currentTheme: string | undefined
  themes: ThemeMap
  switcher: (theme: string) => void
  status: Status
}

export type ThemeMap = {
  [theme: string]: FlattenedVariant
}

export interface FlattenedVariant extends ProcessedVariant {
  /* Url to load the css file from static */
  staticUrl: string
}

const ThemeSwitcherContext = React.createContext<
  IThemeSwitcherContext | undefined
>(undefined)

interface Props {
  themeMap: ThemeMap
  children: React.ReactNode
  insertionPoint?: string | HTMLElement | null
  id?: string
  defaultTheme?: string
  attr?: string
}

export const ThemeSwitcherProvider: React.FC<Props> = ({
  themeMap,
  insertionPoint,
  defaultTheme,
  id = 'current-theme-style',
  attr = 'data-theme',
  ...rest
}: Props) => {
  const [status, setStatus] = React.useState<Status>(Status.idle)
  const [currentTheme, setCurrentTheme] = React.useState<string>(
    defaultTheme || ''
  )

  // Trash for linter
  if (!setStatus)
    console.log('Set status annd such', { setStatus, setCurrentTheme })

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
    (theme: string) => {
      console.log('switcher got theme:', theme)
      if (theme === currentTheme) return
      const variant = themeMap[theme]

      if (variant) {
        setStatus(Status.loading)

        const linkElement = createLinkElement({
          type: 'text/css',
          rel: 'stylesheet',
          id: `${id}_temp`,
          href: variant.staticUrl,
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
        setCurrentTheme(theme)
      } else {
        return console.warn('Could not find specified theme')
      }

      document.body.setAttribute(attr, theme)
    },
    [themeMap, insertStyle, attr, id, currentTheme]
  )

  React.useEffect(() => {
    if (defaultTheme) {
      console.log('default theme provided - switching to it')
      switcher(defaultTheme)
    }
  }, [defaultTheme])

  // React.useEffect(() => {
  //   console.log('🐁🐀 themes:', themes)

  // }, [themes])

  React.useEffect(() => {
    console.log('🐁🐀 themeMap:', themeMap)
    const themes = Object.keys(themeMap)

    console.log('🐁🐀 themes:', themes)
    themes.map((theme) => {
      const variant = themeMap[theme]
      const themeAssetId = `theme-prefetch-${theme}`
      if (!document.getElementById(themeAssetId)) {
        const stylePrefetch = document.createElement('link')
        stylePrefetch.rel = 'prefetch'
        stylePrefetch.type = 'text/css'
        stylePrefetch.id = themeAssetId
        stylePrefetch.href = variant.staticUrl

        insertStyle(stylePrefetch)
      }
      return ''
    })
  }, [themeMap])

  const value = {
    switcher,
    status,
    currentTheme,
    themes: themeMap
  }

  return <ThemeSwitcherContext.Provider value={value} {...rest} />
}

export const useThemeSwitcher = (): IThemeSwitcherContext => {
  const context = React.useContext(ThemeSwitcherContext)
  if (!context) {
    throw new Error(
      'To use `useThemeSwitcher`, component must be within a ThemeSwitcherProvider'
    )
  }
  return context
}
