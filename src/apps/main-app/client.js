import React from 'react'
import MainApp from './app'
// import UserApp from './app'

export const name = 'Djitsu Main App'

// export const check = /^([^.]+)[.]((djit[.]me)|(djitapp.local))$/i

export const app = () => {
  return () => <MainApp />
}

export default {
  name,
  app
  // check
}
