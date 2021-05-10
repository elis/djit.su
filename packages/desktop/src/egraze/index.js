import config from './egraze.config'
import buildPlugins from './egraze-plugins'

const cache = {}

/**
 * Get Egraze plugin API
 * @param {string} name
 * @returns exposed plugin API
 */
export const plugin = name => {
  if (!cache.initial.has(name))
    throw new Error(`No plugin API named "${name}" available`)
  return cache.initial.get(name)
}

export async function main(app, options) {
  const plugins = await buildPlugins(config.plugins)
  const initial = await plugins.main.init(app, options)
  cache.plugins = plugins
  cache.initial = new Map(Object.entries(initial))
  return { ...plugins.main, plugin }
}

export async function renderer(App, options) {
  const plugins = await buildPlugins(config.plugins)
  const initial = await plugins.renderer.init(App, options)
  cache.plugins = plugins
  cache.initial = new Map(Object.entries(initial))
  return { ...plugins.renderer, plugin }
}
