import bindLocalFilesystem from "./host-filesystem"

export const name = 'filesystem'

export const main = {
  init: (options, app, config) => {
    console.log('Initializing Filesystem Support!', config)
    bindLocalFilesystem(app, config)
  },
  onReady: options => {
    console.log('🗃 🗄 Egraze Filesystem Ready Plugin Ready!', options)
  }
}
