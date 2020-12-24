import React from 'react'
import DjitsuTheme from 'djitsu/theme'
import { Route } from 'djitsu/adapters/routes'

import CompileProvider from 'djitsu/providers/compile'
import TelemetryProvider from 'djitsu/providers/telemetry'
import { useUserApp } from 'apps/user-app/user-app.provider'

import AppPage from './app-page'
import NotebookProvider from 'djitsu/providers/notebook'
import { StoreWrapper } from 'djitsu/store'

export const UserAppWrapper = (props) => {
  return (
    <TelemetryProvider>
      <DjitsuTheme theme={props?.match?.params?.theme}>
        <Route path='/*' component={UserAppDocument} />
      </DjitsuTheme>
    </TelemetryProvider>
  )
}

const UserAppDocument = () => {
  const [{ username, notebookName }] = useUserApp()
  return (
    <StoreWrapper>
      <CompileProvider>
        <NotebookProvider>
          <AppPage username={username} notebookName={notebookName} />
        </NotebookProvider>
      </CompileProvider>
    </StoreWrapper>
  )
}

export default UserAppWrapper
