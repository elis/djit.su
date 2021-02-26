import React from 'react'
import RunnerHost from './host'
import RunnerGuest from './guest'
import { RAZZLE_USER_CONTENT_URL } from 'djitsu/utils/env'

export const RunnerHandler = (props) => {
  const {
    documentId,
    notebook,
    isHost,
    onChange,
    theme,
    exported,
    isNotebook,
    getNotebook
  } = props
  return isHost ? (
    <RunnerHost
      src={`${RAZZLE_USER_CONTENT_URL}/${theme}/runner`}
      notebook={notebook}
      onChange={onChange}
      exported={exported}
      isNotebook={isNotebook}
      getNotebook={getNotebook}
    />
  ) : (
    <RunnerGuest documentId={documentId} />
  )
}

export default RunnerHandler
