import Electron from 'electron'
import initEgraze from './egraze'

start()

async function start () {
  console.log('what do we init?', initEgraze)
  const egraze = initEgraze()
  console.log('what do we egraze?', egraze)

  const onReadyResult = await egraze.onReady({} as Electron.Event, {}, Electron.app)
  console.log('onReadyResult?', onReadyResult)
}
