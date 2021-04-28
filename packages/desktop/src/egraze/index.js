import config from './egraze.config'
import initPlugins from './egraze-plugins'

const cache = {}

export default async function initEgraze() {
  console.log('egraze initialized!')
  const plugins = await initPlugins(config.plugins)
  console.log('plguins initialized!', plugins)
  cache.plugins = plugins
  return plugins
}

export const plugin = name => {
  console.log('Getting plugin', name)

  return {}
}
