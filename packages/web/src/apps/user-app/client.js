import React from 'react'
import UserApp from './app'

export const name = 'User App'

export const check = /^(?:(?:([^.]+)[.])|(?:([^.]+)[.])(?:([^.]+)[.]))djitsu[.](me|local)$/i

export const app = (cr) => {
  const conf = {
    username: cr[3] || cr[1],
    notebookName: cr[2] || 'main',
    exportName: 'Main'
  }
  return () => <UserApp {...conf} />
}

export default {
  name,
  app,
  check
}
