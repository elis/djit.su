import { ssr } from 'djitsu/utils/ssr'
const name = 'graze-sentry'

export const client = {
  name,
  onLoad: ({ dsn }) => {
    return {
      dsn
    }
  },
  Wrapper: ({ dsn, children }) => {
    const Sentry = require('@sentry/browser')

    Sentry.init({ dsn })
    return children
  }
}

export const app = {
  onLoad: () => ({}),
  Wrapper: ({ children }) => children,
  expose: (plugin) => {
    if (ssr) return null

    const {
      options: { exposeName }
    } = plugin

    const n = exposeName || name
    const Sentry = require('@sentry/browser')

    return {
      [n]: {
        setProperty: (prop, value) => {
          Sentry.configureScope(function (scope) {
            scope.setExtra(prop, value)
          })
        },
        setProperties: (properties) => {
          Sentry.configureScope(function (scope) {
            Object.entries(properties).map(([prop, val]) =>
              scope.setExtra(prop, val)
            )
          })
        },
        setUser: (properties) => {
          Sentry.configureScope(function (scope) {
            scope.setUser(properties)
          })
        }
      }
    }
  }
}
