import React from 'react'

export default (options) => ({
  client: client(options),
  server: server(options)
})

const client = (options) => ({
  onLoad: () => {
    // const jssStyles = document.getElementById('less-server-side')
    // if (jssStyles && jssStyles.parentNode) {
    //   setTimeout(() => {
    //     jssStyles.parentNode.removeChild(jssStyles)
    //   }, 8)
    // }
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
  onRequest: () => ({}),
  pre: (plugin, req, res) => {
    // console.log('Whats', req, res)
    Object.assign(local, { req, res })
  },
  output: (props, markup) => {
    const theme = options?.theme?.(...props.args) ?? ''

    const regex = /class="djs-theme ([^"]*)"/i
    const matched = markup.match(regex)
    const themed = matched?.[1] === 'dark' ? 'dark' : 'light'

    const dropcss = require('dropcss')
    const path = require('path')
    const fs = require('fs')
    fs.writeFileSync(
      path.resolve(__dirname, 'test_output_less.css'),
      `${theme}`
    )

    let cleaned = dropcss({
      html: `<html><body class="djs-theme ${themed}"><div id="root">${markup}</div></body></html>`,
      css: `${theme}`
    })

    return [
      `<style id="less-server-side">${cleaned.css}</style><script>window.__DJS_THEME="${themed}";</script>`
    ]
  },
  Wrapper: ({ children }) => {
    return <>{children}</>
  }
})
