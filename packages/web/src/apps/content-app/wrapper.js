import React, { useMemo } from 'react'
import DjitsuTheme from 'djitsu/theme'
import DocumentIFrame from 'djitsu/components/document-iframe'
import { Route } from 'djitsu/adapters/routes'

import TelemetryProvider from 'djitsu/providers/telemetry'

export const UserContent = () => (
  <Route path='/user-content/:theme/:container?' component={UserContentInner} />
)
export const UserContentInner = (props) => {
  return (
    <TelemetryProvider>
      <DjitsuTheme theme={props?.match?.params?.theme}>
        <Route
          path='/user-content/:theme/:container?'
          component={UserContentDocument}
        />
        <span data-iframe-height />
      </DjitsuTheme>
    </TelemetryProvider>
  )
}

const UserContentDocument = (props) => {
  const isEditor = useMemo(() => props?.match?.params?.container !== 'runner', [
    props?.match?.params?.container
  ])
  return (
    <DocumentIFrame
      isFrame
      isEditor={isEditor}
      documentId={props?.match?.params?.documentId}
    />
  )
}

export default UserContent
