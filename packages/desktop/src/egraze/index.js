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

export default async function Egraze(app, options) {
  const plugins = await buildPlugins(config.plugins)
  const initial = await plugins.init(app, options)
  cache.plugins = plugins
  cache.initial = new Map(Object.entries(initial))
  return { ...plugins, plugin }
}
