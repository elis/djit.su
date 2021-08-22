import { ThemeSwitcherProvider } from 'djitsu/theme/css-theme-switcher'
import React from 'react'
import plugins from '../../'
import fs from 'fs'
import path from 'path'

export const name = 'graze-theme'
export default (options) => ({
  client: client(options),
  server: server(options),
  app: app(options)
})

const app = (options) => ({
  name,
  onLoad: () => ({}),
  Wrapper: ({ children }) => children,
  expose: (...args) => {
    console.log('🍄 onExpose:', args)
  }
})

const client = (options) => ({
  onLoad: () => {
    const themes = window.__DJITSU_THEMES
    console.log('🌵 Themes from SSR', themes)

    // // const jssStyles = document.getElementById('less-server-side')
    // // if (jssStyles && jssStyles.parentNode) {
    // //   setTimeout(() => {
    // //     jssStyles.parentNode.removeChild(jssStyles)
    // //   }, 8)
    // // }
    // options
    //   ?.theme?.({
    //     params: {
    //       theme: window?.__DJS_THEME === 'dark' ? 'dark' : 'light'
    //     }
    //   })
    //   ?.then?.(() => {
    //     const jssStyles = document.getElementById('less-server-side')
    //     if (jssStyles && jssStyles.parentNode) {
    //       jssStyles.parentNode.removeChild(jssStyles)
    //     }
    //   })

    console.log('🌵 Graze Theme', plugins.exposed)
  },
  Wrapper: function GrazeThemeWrapper({ children }) {
    const dethemes = require('../../../../public/themes/themes.json')
    console.log('dethemes:', dethemes)
    // const dethemes = require('build/public/')
    const demp = false

    const themeData = {
      defaultTheme: 'djitsu-dark-theme'
    }

    const themes = dethemes.themes.reduce(
      (result, theme) => ({
        ...result,
        ...theme.variants.reduce(
          (vs, variant) => ({
            ...vs,
            [variant.name]: {
              ...variant,
              staticUrl: `/themes/${variant.css}`
            }
          }),
          {}
        )
      }),
      {}
    )
    if (demp) return <>{children}</>
    return (
      <ThemeSwitcherProvider
        attr='data-djitsu-theme'
        defaultTheme={themeData.defaultTheme}
        themeMap={themes}
        themes={dethemes.themes}
      >
        {children}
      </ThemeSwitcherProvider>
    )
  }
})

const local = {}

const server = (options) => ({
  onRequest: () => {
    // const theme = options?.theme?.(...props.args) ?? ''
    const dethemes = require('../../../../public/themes/themes.json')
    const themes = flattenThemes(dethemes.themes)

    const themesPath = path.resolve(__dirname, 'public/')
    const cache = {}
    const api = {
      themes,
      getCss: (filepath) => {
        if (cache[filepath]) return cache[filepath]
        const cssPath = path.join(themesPath, filepath)
        const cssData = fs.readFileSync(cssPath, 'utf-8')
        cache[filepath] = cssData
        return cssData
      }
    }

    plugins.exposed.theme = api
    return api
  },
  pre: (plugin, req, res) => {
    // console.log('Whats', req, res)
    Object.assign(local, { req, res })
  },
  output: (props, markup) => {
    // const theme = options?.theme?.(...props.args) ?? ''
    const dethemes = require('../../../../public/themes/themes.json')
    const themes = flattenThemes(dethemes.themes)

    const regex = /class="djs-theme ([^"]*)"/i
    const matched = markup.match(regex)
    const themed = matched?.[1] === 'dark' ? 'dark' : 'light'
    // console.log('🌻🌻 What is markup?', markup)
    const regex2 = /data-djitsu-theme="([^"]*)"/i
    const matched2 = markup.match(regex2)
    // console.log('🌻 Matched:', matched2)
    const themed2 = matched2?.[1]
    console.log('🌻 Matched theme:', themed2)

    const variant = themes[themed2]
    console.log('🌻 Variant:', variant)

    const themesPath = path.resolve(__dirname, 'public/')
    const cssPath = path.join(themesPath, variant.staticUrl)
    console.log('🌻 Variant themesPath, cssPath:', {
      themesPath,
      cssPath,
      __dirname
    })
    // const cssData = fs.readFileSync(cssPath, 'utf-8')
    // console.log('🌻 Variant cssData:', cssData)
    console.log('🌻 plugins:', plugins)

    // const dropcss = require('dropcss')
    // const path = require('path')
    // const fs = require('fs')
    // fs.writeFileSync(
    //   path.resolve(__dirname, 'test_output_less.css'),
    //   `${theme}`
    // )

    // let cleaned = dropcss({
    //   html: `<html><body class="djs-theme ${themed}"><div id="root">${markup}</div></body></html>`,
    //   css: `${theme}`
    // })

    return [
      `<link rel="stylesheet" href="${variant.staticUrl}" />`,
      `<script>
  window.__DJITSU_THEMES=${JSON.stringify(themes)};
  window.__DJITSU_THEME="${themed2}";
</script>`
    ]
  },
  Wrapper: ({ children, ...rest }) => {
    console.log('🌾 rest of props to wrapper', rest)
    return (
      <ThemeSwitcherProvider
        attr='data-djitsu-theme'
        defaultTheme={'djitsu-dark-theme'}
      >
        {children}
      </ThemeSwitcherProvider>
    )
  }
})

const flattenThemes = (themes) =>
  themes.reduce(
    (result, theme) => ({
      ...result,
      ...theme.variants.reduce(
        (vs, variant) => ({
          ...vs,
          [variant.name]: {
            ...variant,
            staticUrl: `/themes/${variant.css}`
          }
        }),
        {}
      )
    }),
    {}
  )
