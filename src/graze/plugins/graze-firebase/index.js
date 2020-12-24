const name = 'graze-firebase'

const initialized = {}

export const client = {
  onLoad: () => ({}),
  pre: async ({ options: { config, services } }) => {
    const resultServices = await require('./firebase').initialize(
      config,
      services
    )
    Object.assign(initialized, resultServices)
    return {
      services: resultServices
    }
  }
}
export const server = {
  onRequest: () => ({}),
  pre: async ({ options: { config, services } }, req, res) => {
    // pre: async (...argz) => {
    // console.log('PRE LOADING config:', config)
    // console.log('PRE LOADING:', Flugin)
    // console.log('PRE LOADING:', services, config)
    const doFalse = false
    if (doFalse) console.log(req, res)
    const resultServices = await require('./firebase').initialize(
      config,
      services
    )
    Object.assign(initialized, resultServices)
    return {
      firebase: resultServices
    }
  }
}

export const app = {
  onLoad: () => {
    return {}
  },
  Wrapper: ({ children }) => {
    return children
  },
  expose: (plugin) => {
    const {
      options: { exposeName }
    } = plugin
    const n = exposeName || name
    return {
      firebase: initialized,
      ...(exposeName && !!initialized.analytics
        ? {}
        : {
            [n]: {
              logEvent: (eventName, eventData) =>
                initialized.analytics.logEvent(eventName, eventData),
              pageView: (pathname, pageTitle) =>
                initialized.analytics.logEvent('page_view', {
                  page_location: pathname,
                  page_title: pageTitle
                }),
              setProperty: (prop, value) =>
                initialized.analytics.setUserProperties({ [prop]: value }),
              setProperties: (properties) =>
                initialized.analytics.setUserProperties(properties),
              setUser: (properties) =>
                initialized.analytics.setUserProperties(properties)
            }
          })
    }
  }
}
