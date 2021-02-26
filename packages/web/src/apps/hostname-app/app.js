import React from 'react'
import graze, { Addons } from 'graze'
import HostnameAppProvider from './hostname-app.provider'
import Wrapper from './wrapper'

const HostnameApp = (props) => {
  return (
    <HostnameAppProvider hostname={props.hostname}>
      <Addons app={Wrapper} />
    </HostnameAppProvider>
  )
}

const Wrapped = graze.app(HostnameApp)
export default Wrapped
