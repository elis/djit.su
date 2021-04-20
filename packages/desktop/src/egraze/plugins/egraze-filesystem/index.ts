import { EgrazePlugin, EgrazePluginMain } from '../../types'

const main = {
  onReady: (options) => {
    console.log('🗃 🗄 Egraze Filesystem Ready Plugin Ready!', options)
  }
} as EgrazePluginMain


export default {
  main
} as EgrazePlugin
