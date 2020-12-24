import React, { createContext, useContext } from 'react'

const TelemetryProviderContext = createContext([{}, {}, {}])

export const TelemetryProvider = (props) => {
  const reportMissingHandler = (error, message, properties) => {
    console.groupCollapsed(
      'Missing handler case repoted — ' + (message || error.toString())
    )
    console.log('Case details:', { error, message, properties })
    console.groupEnd()
  }

  const state = {}
  const actions = { reportMissingHandler }
  const contextValue = [state, actions]

  return (
    <TelemetryProviderContext.Provider value={contextValue}>
      {props.children}
    </TelemetryProviderContext.Provider>
  )
}

export const useTelemetry = () => useContext(TelemetryProviderContext)

export default TelemetryProvider
