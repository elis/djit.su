import React from 'react'
import ContentApp from './app'
// import UserApp from './app'

export const name = 'Content App'

export const check = () => document.location.href.match(/user-content/)

export const app = () => {
  return () => <ContentApp />
}

export default {
  name,
  app,
  check
}
