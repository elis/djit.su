import config from './egraze.config.renderer'
import buildPlugins from './egraze-plugins'

export default async function renderer(App, options) {
  const plugins = await buildPlugins(config.plugins)
  const initialized = await plugins.renderer.init(options)

  return { ...initialized, ...plugins.renderer, plugins }
}
