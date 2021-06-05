import React from 'react'
import { render } from 'react-dom'
import App from './App'
import renderer from './egraze/renderer.process'

const launch = async () => {
  const egraze = await renderer(App, {})
  const { Wrapped } = egraze
  render(<Wrapped />, document.getElementById('root'))
}
launch()
