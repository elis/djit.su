import bindLocalFilesystem from './host-filesystem'

export const name = 'filesystem'

/** @type {import('../../egraze-plugins').MainPlugin} */
export const main = {
  init: (options, fields, app, config) => {
    console.log('Initializing Filesystem Support!', config)
    bindLocalFilesystem(app, config)
  },
  onReady: options => {
    console.log('🗃 🗄 Egraze Filesystem Ready Plugin Ready!', options)
  }
}
