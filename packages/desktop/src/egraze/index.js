import config from './egraze.config'
import initPlugins from './egraze.plugins'

export default function initEgraze() {
  console.log('egraze initialized!')
  const plugins = initPlugins(config.plugins)
  console.log('plguins initialized!', plugins)

  return plugins
}
