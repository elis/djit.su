import React from 'react'
import { render } from 'react-dom'
import DjitsuApp from './djitsu'
import renderer from './egraze/renderer.process'

const launch = async () => {
  const egraze = await renderer(DjitsuApp, {})
  const { Wrapped } = egraze
  render(<Wrapped />, document.getElementById('root'))
}
launch()
