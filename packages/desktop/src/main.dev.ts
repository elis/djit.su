import 'core-js/stable'
import 'regenerator-runtime/runtime'
import { app } from 'electron'
import AppUpdater from './egraze/plugins/egraze-session/main-app'

import main from './egraze/main.process'

export default AppUpdater

const launch = async () => {
  const egraze = await main(app, {
    dirname: __dirname
  })
  app.whenReady().then(egraze.onReady).catch(console.log)
}

launch()
