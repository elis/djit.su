import React from 'react'
// import * as config from './graze.config'

const getCofig = () => {
  try {
    const mod = require('./graze.config')
    return { ...(mod.default || mod) }
  } catch (err) {
    console.error(`🚨〈 Graze Error —`, 'No "graze.config.js" found')
    console.log('Error:', err)
    return {}
  }
}

const config = getCofig()

// Fold plugins
const getPlugins = (xs) => fold(formatPlugins, [], xs)

// Array folding
// https://dev.to/mebble/learn-to-fold-your-js-arrays-2o8p
const fold = (reducer, init, xs) => {
  let acc = init
  for (const x of xs) {
    acc = reducer(acc, x)
  }
  return acc
}

// Plugin folder reducer
const formatPlugins = (acc, plugin) => [...acc, plukPlugin(plugin)]

const plukPlugin = (plugin) => {
  if (plugin.module) {
    const { module, ...options } = plugin
    return [module, options]
  }
  return [plugin, {}]
}

const plugins = getPlugins(config.plugins || [])

// Select plugins
const getPlugin = (part, what, args) =>
  fold(formatPlugin(part, what, args), [], getPluginPart(part))

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
const getPluginPart = (part) => fold(formatPluginsParts(part), [], plugins)

// Plugin parts reducer
const formatPluginsParts = (...parts) => (acc, [plugin, options]) => [
  ...fold(
    formatPluginPart(
      typeof plugin === 'function' ? plugin(options) : plugin,
      options
    ),
    acc,
    parts
  )
]

// Plugin part plucker reducer
const formatPluginPart = (plugin, options) => (acc, part) =>
  plugin && plugin[part] ? [...acc, [plugin[part], options, plugin]] : acc

// Fold plugins actionvation
const activatePlugin = (part, what, args) =>
  fold(onPlugin(what, args), [], getPlugin(part, what, args))

// Plugin activation reducer
const onPlugin = (what, args = []) => (acc, Plugin) => [
  ...acc,
  {
    ...Plugin,
    fields: Plugin[what](Plugin.options, ...args)
  }
]

// Fold plugins `expose`
const exposedPlugins = () => fold(onExpose, {}, getPlugin('app', 'expose'))

// Plugin `expose` reducer
const onExpose = (acc, Plugin) => ({
  ...acc,
  ...((Plugin.expose && Plugin.expose(Plugin)) || {})
})

// Fold plugins `Wrapper`s
const getWrappers = (part, what, results, Wrapped) =>
  fold(
    prepareWrappers(part, what),
    {
      pre: () => ({}),
      wrapper: (wrapped) => wrapped,
      Wrapped
    },
    results
  )

// Plugin `Wrapper` reducer
const prepareWrappers = (part, what) => ({ Wrapped, pre }, Plugin) => {
  const Wrapper = Plugin[part][what]
  // console.log('WRAPPER BUILD', {
  //   part,
  //   what,
  //   Plugin,
  //   pre,
  //   Wrapped,
  //   'Plugin[part][what]': Plugin[part][what]
  // })
  return {
    Wrapped: Wrapper
      ? (props) => (
          <Wrapper {...Plugin} name={Plugin[part].name}>
            <Wrapped {...props} />
          </Wrapper>
        )
      : Wrapped,
    pre: Plugin[part].pre ? () => Plugin[part].pre(Plugin) : pre
  }
}

// Server-side activation
// Executed server-side
export const doOnRequest = async (req, res, voidResponse) => {
  const results = activatePlugin('server', 'onRequest', [
    req,
    res,
    voidResponse
  ])
  const { pre: preProcess } = getServerWrappers(results, <></>)
  const presults = await preProcess({}, req, res, voidResponse)
  // console.log('RESULTS RESULTS:', results)
  // console.log('PRESULTS PRESULTS:', presults)

  return {
    results,
    wrap: (Wrapped) => {
      const { pre, ...wrapResults } = getServerWrappers(
        results,
        Wrapped,
        presults
      )

      if (pre) pre

      return { ...wrapResults }
    }
  }
}

// Fold server plugins `Wrapper`s, `wrapper`s, and `output`s
const getServerWrappers = (results, Wrapped, presults) =>
  fold(
    prepareServerWrappers(presults),
    {
      wrapper: (wrapped) => wrapped,
      output: () => '',
      pre: () => ({}),
      post: (markup) => markup,
      Wrapped
    },
    results
  )

// Server wrapper reducer
const prepareServerWrappers = (presults) => (
  { Wrapped, wrapper, output, pre, post },
  Plugin
) => ({
  Wrapped: Plugin.server.Wrapper
    ? () => (
        <Plugin.server.Wrapper {...{ ...Plugin, presults }}>
          <Wrapped />
        </Plugin.server.Wrapper>
      )
    : Wrapped,
  wrapper: Plugin.server.wrapper
    ? (wrapped) =>
        Plugin.server.wrapper(wrapper(wrapped), { ...Plugin, presults })
    : wrapper,
  output: Plugin.server.output
    ? async (markup, App) => {
        const pluginResult = await Plugin.server.output(
          { ...Plugin, presults },
          markup,
          App
        )
        const prevResult = await output(markup, App)

        const [early, late, trap] =
          pluginResult instanceof Array
            ? [pluginResult[0] || '', pluginResult[1] || '', pluginResult[2]]
            : ['', pluginResult]

        const [pearly, plate, ptrap] =
          prevResult instanceof Array
            ? [prevResult[0] || '', prevResult[1] || '', prevResult[2]]
            : ['', prevResult]

        const [learly, llate] = [
          [pearly, early].filter((x) => x).join('\n'),
          [plate, late].filter((x) => x).join('\n')
        ]

        return [learly, llate, (await ptrap) || (await trap)]
      }
    : output,
  pre: Plugin.server.pre
    ? async (_Plugin, req, res, voidResponse) => ({
        ...((await pre({ ...Plugin, presults }, req, res, voidResponse)) || {}),
        ...((await Plugin.server.pre(
          { ...Plugin, presults },
          req,
          res,
          voidResponse
        )) || {})
      })
    : pre,
  post: Plugin.server.post
    ? (markup) => Plugin.server.post({ ...Plugin, presults }, post(markup))
    : post
})

// Wrap top-level client component with plugins client `Wrapper`s
// Executed client-side exclusively
const wrap = async (Wrapped) => {
  const results = activatePlugin('client', 'onLoad')
  const { Wrapped: Wrapper, pre: preProcess } = getWrappers(
    'client',
    'Wrapper',
    results,
    Wrapped
  )

  const presults = await preProcess()

  return (props) => <Wrapper {...props} presults={presults} />
}

// Wrap top-level app component with plugins app `Wrapper`s
// Executed client- and server-side
export const app = (App) => {
  const results = activatePlugin('app', 'onLoad')

  // console.log('🐊 APP APP APP', results)

  const { Wrapped: Wrapper } = getWrappers('app', 'Wrapper', results, App)
  return Wrapper
}

// Generate plugins `Addon`s
// Executed client- and server-side
export const Addons = (props) => {
  const results = activatePlugin('app', 'onRender')

  const outputs = getAppAddons(results)
  if (outputs && outputs.length) {
    const addons = outputs.map((Addon, index) => (
      <Addon {...props} key={`graze addon #${index}`} />
    ))
    return addons
  }

  const App = props.app

  return [<App key='default page' />]
}

// Fold plugins app `Addon`s
const getAppAddons = (results) => fold(prepareAppAddons, [], results)

// Plugin `Addon` reducer
const prepareAppAddons = (acc, Plugin) =>
  Plugin.app.Addon ? [...acc, Plugin.app.Addon] : acc

// Plugin `expose` reducer
const onMiddleware = (req, res, next) => (acc, Plugin) =>
  acc || (Plugin.middleware && Plugin.middleware(req, res, next))
const getMiddlewares = (req, res, next) =>
  fold(onMiddleware(req, res, next), false, getPlugin('server', 'middleware'))

export const middleware = (req, res, next) => {
  let activated
  const doNext = () => {
    if (!activated) {
      activated = true
      next()
    }
  }
  const middlewares = getMiddlewares(req, res, doNext)
  if (!middlewares) doNext()
}

export default {
  doOnRequest,
  wrap,
  app,
  exposed: exposedPlugins(),
  Addons,
  middleware
}
