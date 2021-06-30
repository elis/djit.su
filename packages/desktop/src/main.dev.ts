import 'core-js/stable'
import 'regenerator-runtime/runtime'
import { app } from 'electron'
import main from './egraze/main.process'

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')()
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

const launch = async () => {
  const egraze = await main(app, {
    dirname: __dirname
  })
  app.whenReady().then(egraze.onReady).catch(console.log)
}

launch()
