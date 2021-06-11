import config from './egraze.config.renderer'
import buildPlugins from './egraze-plugins'
import { cache } from '.'

export default async function renderer(App, options) {
  const plugins = await buildPlugins(config.plugins)
  const initial = await plugins.renderer.init(App, options)
  cache.plugins = plugins
  cache.initial = new Map(Object.entries(initial))
  cache.apis = initial.apis

  return { ...initial, plugins }
}
