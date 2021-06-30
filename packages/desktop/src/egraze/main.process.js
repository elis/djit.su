import config from './egraze.config.main'
import buildPlugins from './egraze-plugins'

export default async function main(app, options) {
  const plugins = await buildPlugins(config.plugins)
  await plugins.main.init(app, options)

  return { ...plugins.main, plugins }
}
