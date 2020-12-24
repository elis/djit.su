import React from 'react'

export default (options) => ({
  client: client(options),
  server: server(options)
})

const client = (options) => ({
  onLoad: () => {
    options
      ?.theme?.({
        params: {
          theme: window?.__DJS_THEME === 'dark' ? 'dark' : 'light'
        }
      })
      ?.then?.(() => {
        const jssStyles = document.getElementById('less-server-side')
        if (jssStyles && jssStyles.parentNode) {
          jssStyles.parentNode.removeChild(jssStyles)
        }
      })
  },
  Wrapper: ({ children }) => {
    return children
  }
})

const local = {}

const server = (options) => ({
  onRequest: () => {
    const { ServerStyleSheet } = require('styled-components')

    const sheet = new ServerStyleSheet()
    return {
      sheet
    }
  },
  pre: (plugin, req, res) => {
    Object.assign(local, { req, res })
  },
  wrapper: (wrapped, { fields: { sheet } }) => {
    return sheet.collectStyles(wrapped)
  },
  output: (props, markup) => {
    const {
      fields: { sheet }
    } = props
    const theme = options?.theme?.(...props.args) ?? ''

    const styled = sheet.instance.toString()
    const regex = /class="djs-theme ([^"]*)"/i
    const matched = markup.match(regex)
    const themed = matched?.[1] === 'dark' ? 'dark' : 'light'

    const dropcss = require('dropcss')
    let cleaned = dropcss({
      html: `<html><body class="djs-theme ${themed}"><div id="root">${markup}</div></body></html>`,
      css: `${theme}${styled}`
    })

    return [
      `<style id="less-server-side">${cleaned.css}</style><script>window.__DJS_THEME="${themed}";</script>`
    ]
  },
  Wrapper: ({ children }) => {
    return <>{children}</>
  }
})
