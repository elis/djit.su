import { App } from 'electron'

export default {
  activate: (app: App) => app.on('activate', () => {
    console.log('App activate!.')
  }),
  ready: (app: App) => app.on('ready', (_event, info) => {
    console.log('App ready!', _event, info)
    // local.ready = {
    //   info
    // }
  })
} as Record<string, (app: App) => void>
