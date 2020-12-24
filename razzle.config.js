/* eslint-disable @typescript-eslint/no-use-before-define */
const razzleHeroku = require('razzle-heroku')
// const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const isHeroku = require('is-heroku')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  rules: {},
  plugins: [
    copyFiles,
    removeFSClientSide,
    useRuntimePortEnvironmentVariable,
    // WebpackSplitChunksRazzlePlugin({
    //   // include both initial and async imports for chunking, not just initial
    //   chunks: 'all',
    //   // default is 3
    //   maxInitialRequests: Infinity,
    //   // default is 30000
    //   minSize: 0
    // }),
    // WebpackPerformanceHintsRazzlePlugin({
    //   // Use a custom assetFilter to not warn about big source maps or vendor bundle
    //   assetFilter: function (assetFilename) {
    //     const isSrcMap = /\.map$/.test(assetFilename)
    //     const isVendorBundle = /vendor/.test(assetFilename)
    //     return !(isSrcMap || isVendorBundle)
    //   }
    // }),
    {
      name: 'less',
      options: {
        less: {
          dev: {
            javascriptEnabled: true,
            sourceMap: true,
            modules: false
          },
          prod: {
            javascriptEnabled: true,
            sourceMap: false,
            modules: false
          }
        },
        css: {
          dev: {
            sourceMap: true,
            importLoaders: 1,
            modules: false
          },
          prod: {
            sourceMap: true,
            importLoaders: 1,
            modules: false
          }
        }
      }
    },
    'babel-ts'
  ]
}

function copyFiles(config, env, webpack, options) {
  if (env.target === 'node') {
    config.plugins = [
      ...(config.plugins || []),
      new CopyPlugin({
        patterns: [
          {
            from: '**/iframeResizer.contentWindow*.js',

            context: require('path').resolve(
              __dirname,
              'node_modules',
              'iframe-resizer',
              'js'
            ),
            // from:
            // 'node_modules/iframe-resizer/js/iframeResizer.contentWindow*.js',
            to: 'public/vendors/iframe-resizer/[name].[ext]'
          },
          {
            from: '**/**',
            context: require('path').resolve(__dirname, 'public'),
            to: 'public/[path][name].[ext]'
          }
        ]
      })
    ]
  }
  return config
}
function removeFSClientSide(config, env, webpack, options) {
  const { target, dev } = env

  // console.log('TARGET:', target)
  // console.log('CONFIG:', config)
  if (target === 'web') {
    return Object.assign({}, config, {
      node: { ...(config.node || {}), fs: 'empty' }
    })
  }
  return config
}

function NoopRazzlePlugin() {
  return function NoopRazzlePluginFunc(config) {
    return config
  }
}

function WebpackPerformanceHintsRazzlePlugin(pluginOptions) {
  return function WebpackPerformanceHintsRazzlePluginFunc(config) {
    return {
      ...config,
      performance: {
        ...config.performance,
        assetFilter: function (assetFilename) {
          const isSrcMap = /\.map$/.test(assetFilename)
          const isVendorBundle = /vendor/.test(assetFilename)
          return !(isSrcMap || isVendorBundle)
        }
      }
    }
  }
}

/**
 * Update config to use process.env.PORT provided at *runtime*, not build-time, which is the default behavior
 */
// https://github.com/jaredpalmer/razzle/issues/906#issuecomment-467046269
function useRuntimePortEnvironmentVariable(config, { target, dev }, webpack) {
  const appConfig = Object.assign({}, config)

  // @BUG: Do not inline certain env vars; https://github.com/jaredpalmer/razzle/issues/356
  if (target === 'node') {
    const idx = appConfig.plugins.findIndex(
      (plugin) => plugin.constructor.name === 'DefinePlugin'
    )
    const { definitions } = appConfig.plugins[idx]
    const newDefs = Object.assign({}, definitions)

    delete newDefs['process.env.PORT']
    delete newDefs['process.env.HOST']
    delete newDefs['process.env.PUBLIC_PATH']

    appConfig.plugins = [].concat(appConfig.plugins)
    appConfig.plugins[idx] = new webpack.DefinePlugin(newDefs)
  }

  return appConfig
}

/**
 * Remove specific env variables
 */
function removeCustomEnvVariables(names = []) {
  return function removeVariables(config, { target, dev }, webpack) {
    const appConfig = Object.assign({}, config)

    // @BUG: Do not inline certain env vars; https://github.com/jaredpalmer/razzle/issues/356
    if (target === 'node') {
      const idx = appConfig.plugins.findIndex(
        (plugin) => plugin.constructor.name === 'DefinePlugin'
      )
      const { definitions } = appConfig.plugins[idx]
      const newDefs = Object.assign({}, definitions)

      names.map((name) => {
        delete newDefs['process.env.' + name]
      })

      appConfig.plugins = [].concat(appConfig.plugins)
      appConfig.plugins[idx] = new webpack.DefinePlugin(newDefs)
    }

    return appConfig
  }
}

/**
 * Razzle Plugin to split common libraries into a chunk named 'vendor'.
 * The idea is that this bundle will change way less often than the src code
 * of this app, so will mean less average download size because vendor can be cached.
 * Taken from https://github.com/jaredpalmer/razzle/tree/master/examples/with-vendor-bundle
 */
function WebpackSplitChunksRazzlePlugin(pluginOptions = {}) {
  return function WebpackSplitChunksRazzlePluginFunc(
    razzleConfigBefore,
    { target, dev },
    webpack
  ) {
    const config = Object.assign({}, razzleConfigBefore)

    // Change the name of the server output file in production
    if (target === 'web') {
      // modify filenaming to account for multiple entry files
      config.output.filename = dev
        ? 'static/js/[name].js'
        : 'static/js/[name].[hash:8].js'

      // I think these are the default that webpack sets
      // https://webpack.js.org/plugins/split-chunks-plugin/#optimizationsplitchunks
      const defaultSplitChunksConfig = {
        chunks: 'async',
        minSize: 30000,
        maxSize: 0,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        automaticNameDelimiter: '~',
        automaticNameMaxLength: 30,
        name: true,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      }
      config.optimization.splitChunks = {
        ...defaultSplitChunksConfig,
        ...config.optimization.splitChunks,
        ...pluginOptions
      }
    }

    return config
  }
}
