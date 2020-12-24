import { ssr } from 'djitsu/utils/ssr'
import fromPairs from 'lodash/fromPairs'

const getPlugins = () => [
  // // * Styled Components
  // require('./plugins/graze-styled-components'),

  // * Djitsu
  require('./plugins/graze-djitsu'),

  // * SSR Preload
  {
    module: require('./plugins/graze-ssr-preload'),
    maxTimeout: 8000,
    defaults: {
      timeout: 300 // milliseconds
    }
  },

  // * SSR Output
  {
    module: require('./plugins/graze-ssr-output'),
    maxTimeout: 800,
    defaults: {
      timeout: 300 // milliseconds
    }
  },

  // * Cookies
  require('./plugins/graze-cookies'),

  // * ENV Variables
  {
    module: require('./plugins/graze-env'),
    re: /^(NODE_ENV|ENV|env|RAZZLE_|npm_package_(version|dv|ci(Name|Build(Number|Url))|tag|hash|shorthash))/
  },

  // * React Helmet
  {
    module: require('./plugins/graze-helmet'),
    title: 'Advanced Development, Execution, and Applications Platform',
    props: {
      titleTemplate: '%s — djit.su'
    }
  },

  // * Prettier
  // {
  //   module: require('./plugins/graze-prettier'),
  //   beautify: {
  //     indent_size: 1,
  //     keep_array_indentation: true,
  //     unformatted: ['style', 'div']
  //   }
  // },

  // // * Fullstory
  ...(((ssr && process.env) || (!ssr && window.env))?.NODE_ENV !== 'development'
    ? [
        {
          module: require('./plugins/graze-fullstory'),
          fsOrg: 'VQETF', // TODO: EXPORT TO ENV VARIABLES
          exposeName: 'telemetry-fullstory'
        }
      ]
    : []),

  // * Sentry
  ...(((ssr && process.env) || (!ssr && window.env))?.NODE_ENV !== 'development'
    ? [
        {
          module: require('./plugins/graze-sentry'),
          exposeName: 'telemetry-sentry',
          // TODO: EXPORT TO ENV VARIABLES
          dsn:
            'https://e5000e85d33e492c8579c3e6b7bbb6d1@o403535.ingest.sentry.io/5266320'
        }
      ]
    : []),

  // // * Google Analytics
  // ...(((ssr && process.env) || (!ssr && window.env))?.NODE_ENV !== 'development'
  //   ? [
  //       {
  //         module: require('./plugins/graze-ga'),
  //         exposeName: 'telemetry-google-analytics',
  //         trackingId: 'G-8NCQM3TJTD' // TODO: EXPORT TO ENV VARIABLES
  //       }
  //     ]
  //   : []),

  // * Firebase
  {
    module: require('./plugins/graze-firebase'),
    config: getFirebaseConfig(),
    exposeName: 'telemetry-firebase'
  },

  // // * LESS Support + Theme
  // {
  //   module: require('./plugins/graze-less').default,
  //   theme: (req) => {
  //     const cookie = ssr ? req?.cookies : parseCookie(document.cookie)
  //     const themed = req?.params?.theme || cookie?.['djitsu-theme']

  //     const loaded =
  //       themed === 'dark'
  //         ? require('djitsu/theme/themes/dark.less')
  //         : require('djitsu/theme/themes/light.less')

  //     return loaded
  //   }
  // },

  // * styled components & less dropcss
  {
    module: require('./plugins/graze-styled-less').default,
    theme: (req) => {
      const cookie = ssr ? req?.cookies : parseCookie(document.cookie)
      const themed = req?.params?.theme || cookie?.['djitsu-theme']

      const loaded =
        themed === 'dark'
          ? require('djitsu/theme/themes/dark.less')
          : require('djitsu/theme/themes/light.less')

      return loaded
    }
  },

  // * body-class (for antd and dark/light themes support)
  {
    module: require('./plugins/graze-body-class'),
    class: 'djs-theme'
  }
]

const parseCookie = (cookie) =>
  fromPairs(`${cookie}`.split('; ').map((e) => e.split('=')))

export const getFirebaseConfig = () => {
  const {
    RAZZLE_FIREBASE_APIKEY: apiKey,
    RAZZLE_FIREBASE_APP_ID: appId,
    RAZZLE_FIREBASE_AUTH_DOMAIN: authDomain,
    RAZZLE_FIREBASE_DATABASE_URL: databaseURL,
    RAZZLE_FIREBASE_MEASUREMENT_ID: measurementId,
    RAZZLE_FIREBASE_MESSAGING_SENDER_ID: messagingSenderId,
    RAZZLE_FIREBASE_PROJECT_ID: projectId,
    RAZZLE_FIREBASE_STORAGE_BUCKET: storageBucket // Storage
  } = ssr ? process.env : window.env

  const options = {
    apiKey,
    appId,
    authDomain,
    databaseURL,
    messagingSenderId,
    projectId,
    storageBucket,
    ...(ssr ? {} : { measurementId })
  }

  return options
}

export const plugins = getPlugins()
