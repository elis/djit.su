import React from 'react'
import HostnameApp from './app'
// import UserApp from './app'

export const name = 'Hostname App'

export const check = /^([^.]+)[.]((djit[.]me)|(djitapp.local)|(works|org|com|camp|(co\.)?il))$/i

export const app = (cr) => {
  console.log('Readying Hostname app!', cr)
  const conf = {
    hostname: cr[1]
  }
  console.log('Readying Hostname app conf!', conf)
  return () => <HostnameApp {...conf} />
}

export default {
  name,
  app,
  check
}
