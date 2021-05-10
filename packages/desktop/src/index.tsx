import React from 'react'
import { render } from 'react-dom'
import App from './App'
import { renderer } from './egraze'

const launch = () => {
  console.log('🚃 📇 Launching Egraze:')
  const EgrazeApp = renderer(App, {})
  // console.log('🚃 📇 Egraze App Initializedxxx:', EgrazeApp)

  render(<>Sup</>, document.getElementById('root'))
}
launch()
