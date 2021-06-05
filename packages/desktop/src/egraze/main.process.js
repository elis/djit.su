import config from './egraze.config.main'
import buildPlugins from './egraze-plugins'
import { cache, plugin } from './'

export default async function main(app, options) {
  const plugins = await buildPlugins(config.plugins)
  const initial = await plugins.main.init(app, options)
  cache.plugins = plugins
  cache.initial = new Map(Object.entries(initial))
  return { ...plugins.main, plugin }
}
