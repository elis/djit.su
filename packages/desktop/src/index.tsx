import React from 'react'
import { render } from 'react-dom'
import DjitsuApp from './djitsu'
import renderer from './egraze/renderer.process'

const launch = async () => {
  const egraze = await renderer({})
  const { onReady } = egraze
  const App = await onReady(DjitsuApp)
  render(<App />, document.getElementById('root'))
}
launch()
