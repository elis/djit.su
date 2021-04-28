/* eslint-disable @typescript-eslint/no-use-before-define */
import chalk from 'chalk'

const S = chalk`{bgBlack {yellow ⌬} }`

export default async function initEgrazePlugins(list) {
  console.log(S, ' sup plugins', list)
  const plugins = await getPlugins(list)
  // const plugins: any[] = []
  console.log(S, ' ! Plugins result:', plugins)

  const init = async (...args) => {
    const result = activatePlugins(plugins, 'main', 'init', args)
    console.log('result of  init:', result)
    return result
  }

  const onReady = async (event, info, app) => {
    console.log(S, ' Ready go set!', { event, info })

    // const results = 'testing'
    const results = await activatePlugins(plugins, 'main', 'onReady', [
      event,
      info,
      app
    ])
    console.log(S, ' Result of activating plugin', results, app)
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
  // eslint-disable-next-line no-restricted-syntax
  for (const x of xs) {
    acc = reducer(acc, x)
  }
  return acc
}

const getPlugins = plugins => fold(formatPlugins, [], plugins)

const formatPlugins = (acc, plugin) => [...acc, pluckPlugin(plugin)]

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
const activatePlugins = (plugins, part, what, args) =>
  fold(onPlugin(what, args), [], getPlugin(plugins, part, what, args))

// Plugin activation reducer
const onPlugin = (what, args = []) => (acc, plugin) => [
  ...acc,
  {
    ...plugin,
    // fields: plugin[what](plugin.options, ...args)
    fields: plugin[what](plugin.options, ...args)
  }
]

// Select plugins
const getPlugin = (plugins, part, what, args) =>
  fold(formatPlugin(part, what, args), [], getPluginPart(plugins, part))

// Plugin selector reducer
const formatPlugin = (part, what, args) => (acc, [value, options, root]) =>
  value && value[what]
    ? [
        ...acc,
        {
          [what]: value[what],
          [part]: value,
          options,
          root,
          args
        }
      ]
    : acc

// Fold plugins parts
const getPluginPart = (plugins, part) =>
  fold(formatPluginsParts(part), [], plugins)

// Plugin parts reducer
const formatPluginsParts = (...parts) => (acc, [plugin, options]) => [
  ...fold(formatPluginPart(plugin, options), acc, parts)
]

// Plugin part plucker reducer
const formatPluginPart = (plugin, options) => (acc, part) =>
  plugin && plugin[part]
    ? [...acc, [plugin[part], options, plugin]]
    : // ? [...acc, [plugin[part], options, plugin]]
      acc
