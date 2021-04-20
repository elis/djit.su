import { EgrazePluginModule, EgrazePluginModuleMain } from '../../types'

const main = {
  onReady: (options) => {
    console.log('🙎‍♂️ Egraze Session Plugin Ready!', options)
  }
} as EgrazePluginModuleMain


export default {
  main
} as EgrazePluginModule
