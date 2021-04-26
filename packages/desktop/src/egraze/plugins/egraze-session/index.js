import { createWindow } from './main-app'

const main = {
  init: (options, app) => {
    console.log('Initializing app session', app)

    // local.options = options
    app
      .whenReady()
      .then(() => createWindow(app))
      .catch(console.log)

    return {
      field: 'test'
    }
  },
  onReady: options => {
    console.log('🙎‍♂️ Egraze Session Plugin Ready!', options)
  }
}

export default {
  main
}
