/* eslint-disable @typescript-eslint/no-use-before-define */
import chalk from 'chalk'

const S = chalk`{bgBlack {yellow ⌬} }`

/**
 * Build Egraze plugins
 * @param {PluginConfiguration[]} list - List of plugin configurations
 * @returns {EgrazeApi}
 */
export default async function buildEgrazePlugins(list) {
  const cache = {}
  const plugins = getPlugins(list)

  const init = (app, options) => {
    const activated = activatePlugins(plugins, 'main', 'init', [app, options])
    const initialized = initializePlugins(plugins, activated)
    cache.initialized = initialized
    return initialized
  }

  const onReady = async (event, info, app) => {
    const results = await activatePlugins(
      cache.initialized || plugins,
      'main',
      'onReady',
      [event, info, app]
    )
    return results
  }

  return {
    init,
    onReady
  }
}

// Array folding
// https://dev.to/mebble/learn-to-fold-your-js-arrays-2o8p
const fold = (reducer, init, xs) => {
  let acc = init
  let counter = 0
  // eslint-disable-next-line no-restricted-syntax
  for (const x of xs) {
    acc = reducer(acc, x, counter)
    counter += 1
  }
  return acc
}

/**
 *
 * @param {PluginConfiguration[]} plugins - List of plugin configurations
 * @returns {PluckedPlugin[]}
 */
const getPlugins = plugins => fold(formatPlugins, [], plugins)

/**
 *
 * @param {PluckedPlugin[]} acc - Plucked pluginns
 * @param {PluginConfiguration} plugin - Plugin Configuration
 * @returns {PluckedPlugin[]}
 */
const formatPlugins = (acc, plugin) => [...acc, pluckPlugin(plugin)]

/**
 *
 * @param {PluginConfiguration} plugin
 * @returns {PluckedPlugin}
 */
const pluckPlugin = plugin => {
  if (typeof plugin === 'string') {
    return [require(`./plugins/egraze-${plugin}`), {}]
  }
  if (typeof plugin === 'function') {
    const result = plugin()
    // eslint-disable-next-line no-param-reassign
    plugin = result
  }
  if (typeof plugin.plugin === 'string') {
    return [require(`./plugins/egraze-${plugin.plugin}`), plugin?.options ?? {}]
  }
  if ('main' in plugin || 'renderer' in plugin) {
    return [plugin, {}]
  }

  return [plugin.plugin, plugin.options ?? {}]
}

// Fold plugins activation
/**
 *
 * @param {PluckedPlugin[]} plugins - Plugins to use
 * @param {keyof PluginModule} part - Plugin part to load
 * @param {keyof (MainPlugin | RendererPlugin)} what - 'init', 'onReady'
 * @param {unknown[]} args - Arguments to pass to activation function
 * @returns {ActivatedPlugin}
 */
const activatePlugins = (plugins, part, what, args) =>
  fold(onPlugin(what), [], getPlugin(plugins, part, what, args))

/**
 * Plugin activation reducer wrapper
 * @param {keyof (MainPlugin | RendererPlugin)} what - Section of plugin
 * @returns {PluginActivationReducer}
 */
const onPlugin = what => (acc, plugin) => [
  ...acc,
  {
    ...plugin,
    // fields: plugin[what](plugin.options, ...args)
    fields: plugin[what](plugin.options, ...(plugin.args || []))
  }
]

// Select plugins
/**
 *
 * @param {PluckedPlugin[]} plugins
 * @param {keyof PluginParts} part - Plugin part to get
 * @param {keyof (MainPlugin | RendererPlugin)} what - Section of plugin part to invoke
 * @param {any[]} args - Arguments to pass to invoked function
 * @returns {FormattedPlugin[]}
 */
const getPlugin = (plugins, part, what, args) =>
  fold(formatPlugin(part, what, args), [], getPluginPart(plugins, part))

/**
 * Plugin selector reducer
 * @param {keyof PluginParts} part - Part of plugin to format
 * @param {keyof PluginPart} what - Section of plugin part to format
 * @param {any[]} args - Arguments to pass to invoked function
 * @returns {FormatPluginReducer}
 */
const formatPlugin = (part, what, args) => (
  acc,
  [value, options, root, fields]
) =>
  value && value[what]
    ? [
        ...acc,
        {
          [what]: value[what],
          [part]: value,
          options,
          root,
          args: [fields, ...(args || [])]
        }
      ]
    : acc

/**
 * Fold plugins parts
 * @param {PluckedPlugin[]} plugins - Plucked plugins
 * @param {keyof PluginPart} part - Part of plugin to get
 * @returns {FormattedPluginPart[]}
 */
const getPluginPart = (plugins, part) =>
  fold(formatPluginsParts(part), [], plugins)

/**
 * Plugin parts reducer
 * @param  {...(keyof PluginParts)} parts - Parts to format
 * @returns {FormatPluginPartReducer}
 */
const formatPluginsParts = (...parts) => (acc, [plugin, options, fields]) => [
  ...fold(formatPluginPart(plugin, options, fields), acc, parts)
]

/**
 * Plugin part plucker reducer
 * @param {PluckedPlugin} plugin - Plucked plugin
 * @param {PluginOptions} options - Options for plugin
 * @returns {FormattedPluginPart[]}
 */
const formatPluginPart = (plugin, options, fields) => (acc, part) =>
  plugin && plugin[part]
    ? [...acc, [plugin[part], options, plugin, fields]]
    : // ? [...acc, [plugin[part], options, plugin]]
      acc

/**
 *
 * @param {PluckedPlugin} plugins - Plucked plugins
 * @param {ActivatedPlugin[]} activated - Activated plugins
 * @returns {InitializedPlugin[]}
 */
const initializePlugins = (plugins, activated) =>
  fold(initializedPlugin(plugins), [], activated)

/**
 *
 * @param {PluckedPlugin[]} plugins - Plucked plugins
 * @returns {InitializedPluginReducer}
 */
const initializedPlugin = plugins => (acc, activated, index) => [
  ...acc,
  [plugins[index][0], plugins[index][1], activated.fields]
]

//
//
//
// 888888888888
//      88
//      88
//      88  8b       d8  8b,dPPYba,    ,adPPYba,  ,adPPYba,
//      88  `8b     d8'  88P'    "8a  a8P_____88  I8[    ""
//      88   `8b   d8'   88       d8  8PP"""""""   `"Y8ba,
//      88    `8b,d8'    88b,   ,a8"  "8b,   ,aa  aa    ]8I
//      88      Y88'     88`YbbdP"'    `"Ybbd8"'  `"YbbdP"'
//              d8'      88
//             d8'       88
//
//

/**
 * @callback PluginActivationReducer
 * @param {ActivatedPlugin[]} acc - Accumulator
 * @param {FormattedPlugin} plugin - Formatted plugin
 */

/**
 * @callback FormatPluginPartReducer
 * @param {ForamttedPluginPart[]} acc - Accumulator
 * @param {PluckedPlugin}
 * @returns {FormattedPluginPart[]}
 */

/**
 * @callback FormatPluginReducer
 * @param {FormattedPlugin[]} acc - Accumulator
 * @param {FormattedPluginPart}
 * @returns {FormattedPlugin[]}
 */

/**
 * @callback InitializedPluginReducer
 * @param {InitializedPlugin[]} acc - Accumulator
 * @param {ActivatedPlugin} activated - Activated plugin
 * @param {number} index - Index of activated plugin
 * @returns {InitializedPlugin[]}
 */

/**
 * @typedef {[PluginModule, PluginOptions] | [PluginModule, PluginOptions, PluginFields]} PluckedPlugin
 */

/**
 * @typedef {[PluginPart, PluginOptions, PluginModule, PluginFields]} FormattedPluginPart
 */

/**
 * @typedef {[PluginModule, PluginOptions, PluginFields]} InitializedPlugin
 */

/**
 * @typedef {Object} PluginFields
 */

/**
 * Formatted Plugin
 * @typedef {Object} FormattedPlugin
 * @property {Object} options - Main process plugin
 * @property {FormattedPluginPart} root - Root plugin
 * @property {any[]} args - Arguments collected
 */

/**
 * Activated Plugin
 * @typedef {Object} ActivatedPlugin
 * @extends PluginModule
 * @property {PluginFields} fields - Plugin section activation result
 */

/**
 * Main Process plugin
 * @typedef {Object} MainPlugin
 * @property {InitializePlugin} init - Initialize plugin
 * @property {OnReadyPlugin} onReady - Invoke function when system is ready
 */

/**
 * Renderer Process plugin
 * @typedef {Object} RendererPlugin
 * @property {InitializeRenderer} init - Initialize the renderer
 */

/**
 * @callback InitializePlugin
 * @param {PluginOptions} options - Plugin options provided by config
 * @param {PluginFields} fields - Plugin initialization result
 * @param {import('electron').app} app - Electron app instance
 * @param {InstanceOptions} config - Instance configuration
 */

/**
 * @callback OnReadyPlugin
 * @param {PluginOptions} options - Plugin options provided by config
 * @param {PluginFields} fields - Plugin initialization result
 * @param {import('electron').app} app - Electron app instance
 * @param {InstanceOptions} config - Instance configuration
 */

/**
 * @callback InitializeRenderer
 * @param {PluginOptions} options - Plugin options provided by config
 * @param {InstanceConfiguration} config - Instance configuration
 */

/**
 * @typedef {Object} PluginOptions
 */

/**
 * @typedef {MainPlugin | RendererPlugin} PluginPart
 */

/**
 * @typedef {Object} PluginParts
 * @property {MainPlugin=} main - Main process plugin
 * @property {RendererPlugin=} renderer - Renderer process plugin
 */

/**
 * @typedef {Object} InstanceOptions
 * @property {string} dirname - Execution source directory
 */

/**
 * @typedef {string | PluginConfigurationObject | PluginConfigurationFunction | PluginModule} PluginConfiguration
 */

/**
 * @typedef {Object} PluginConfigurationObject
 * @property {PluginModule} plugin
 * @property {Object} options - Plugin options
 */

/**
 * @callback PluginConfigurationFunction
 * @returns {PluginConfigurationObject}
 */

/**
 * @typedef {Object} EgrazeApi
 * @property {InitializeEgraze} init - Initialize Egraze and it's plugin
 * @property {OnReady} onReady - Execute after all initialization procedures
 */

/**
 * @callback InitializeEgraze
 * @param {import('electron').app} app - Electron app instannce
 * @param {InstanceOptions} options - Instance configuration object
 */

/**
 * @typedef {Object} PluginModule
 * @property {string} name - Valid plugin name to identify by
 * @property {MainPlugin} main - Main process plugin
 * @property {RendererPlugin} renderer - Rendererd process plugin
 */