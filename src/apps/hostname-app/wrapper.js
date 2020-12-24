import React from 'react'
import DjitsuTheme from 'djitsu/theme'
import { Route } from 'djitsu/adapters/routes'

import CompileProvider from 'djitsu/providers/compile'
import TelemetryProvider from 'djitsu/providers/telemetry'
import { useHostnameApp } from './hostname-app.provider'

import HostnamePage from './hostname-page'
import NotebookProvider from 'djitsu/providers/notebook'
import { StoreWrapper } from 'djitsu/store'

export const HostnameApp = (props) => {
  return (
    <TelemetryProvider>
      <DjitsuTheme theme={props?.match?.params?.theme}>
        <Route path='/*' component={HostnameAppDocument} />
      </DjitsuTheme>
    </TelemetryProvider>
  )
}

const HostnameAppDocument = () => {
  const [{ hostname }] = useHostnameApp()
  return (
    <StoreWrapper>
      <CompileProvider>
        <NotebookProvider>
          <HostnamePage hostname={hostname} />
        </NotebookProvider>
      </CompileProvider>
    </StoreWrapper>
  )
}

export default HostnameApp
