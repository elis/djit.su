import React, { createContext, useEffect, useContext } from 'react'
import { withRouter } from 'react-router-dom'
import { ssr } from 'djitsu/utils/ssr'
const name = 'graze-ga'

const initialized = {}

export const server = {
  name,
  onRequest: (options) => {
    return {
      options
    }
  },
  output: ({ options: { trackingId } }) => {
    return `
    <script async src='https://www.googletagmanager.com/gtag/js?id=${trackingId}'></script>
    <script>
      window.dataLayer = window.dataLayer || []
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date())
      
      gtag('config', '${trackingId}')
    </script>`
  }
}

const GAContext = createContext({ pimplim: 'plom' })
export const app = {
  name,
  onLoad: (options) => {
    const ReactGA = require('react-ga')
    if (!ssr) {
      ReactGA.initialize(options)
      Object.assign(initialized, {
        ga: ReactGA.ga()
      })
    }
    return {
      ReactGA,
      Context: GAContext
    }
  },
  Wrapper: ({ fields: { ReactGA, Context }, children }) => {
    return (
      <Context.Provider value={{ ReactGA }}>
        <React.Fragment>
          <StatsReporting options={{ ReactGA }} />
          {children}
        </React.Fragment>
      </Context.Provider>
    )
  },
  expose: (plugin) => {
    const {
      options: { exposeName }
    } = plugin
    const n = exposeName || name
    return {
      GAContext,
      useGA,
      ...(!(exposeName && !!initialized.analytics)
        ? {}
        : {
            [n]: {
              pageView: (page, title) =>
                initialized.ga?.('send', 'pageview', page, { title }),
              setProperty: (prop, value) =>
                initialized.ga?.('set', prop, value),
              setProperties: (properties) =>
                initialized.ga?.('set', properties),
              setUser: (properties) => initialized.ga?.('set', properties)
            }
          })
    }
  },
  Addon: () => {
    return <div>Addon of Graze GraphCMS</div>
  }
}

export const useGA = () => useContext(GAContext)

export const StatsReporting = withRouter(({ options: { ReactGA } }) => {
  useEffect(() => {
    ReactGA.event({
      category: 'Graze Application',
      action: 'Loaded'
    })
  }, [])
  return null
})
