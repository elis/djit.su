import React, { createContext, useContext } from 'react'

const HostnameAppContext = createContext([{}, {}])

export const HostnameAppProvider = (props) => {
  const actions = {}
  const state = {
    hostname: props.hostname
  }
  const value = [state, actions]

  return (
    <HostnameAppContext.Provider value={value}>
      {props.children}
    </HostnameAppContext.Provider>
  )
}

export const useHostnameApp = () => useContext(HostnameAppContext)

export default HostnameAppProvider
