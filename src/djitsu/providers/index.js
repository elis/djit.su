import React from 'react'
import AuthProvider from './auth'
import CompileProvider from './compile'
import NotebookProvider from './notebook'
import SystemProvider from './system'
import TelemetryProvider from './telemetry'
import UserProvider from './user'

const baseProviders = [
  TelemetryProvider,
  AuthProvider,
  SystemProvider,
  UserProvider,
  NotebookProvider,
  CompileProvider
]

export const DjitsuProviders = (props) => {
  return (
    <ProviderWrapper providers={baseProviders}>
      {props.children}
    </ProviderWrapper>
  )
}

DjitsuProviders.propTypes = {}

const ProviderWrapper = ({ providers, children }) => {
  const [Next, ...remaining] = providers

  return (
    <Next>
      {remaining.length > 0 ? (
        <ProviderWrapper providers={remaining}>{children}</ProviderWrapper>
      ) : (
        children
      )}
    </Next>
  )
}

export default DjitsuProviders
