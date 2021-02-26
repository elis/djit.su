import React from 'react'
import EditorHost from './host'
import EditorGuest from './guest'
import { RAZZLE_USER_CONTENT_URL } from 'djitsu/utils/env'

export const EditorHandler = (props) => {
  const {
    documentId,
    notebook,
    isHost,
    onChange,
    newDocumentBlocks,
    theme,
    isNotebook,
    getNotebook
  } = props

  return isHost ? (
    <EditorHost
      src={`${RAZZLE_USER_CONTENT_URL}/${theme}`}
      notebook={notebook}
      onChange={onChange}
      newDocumentBlocks={newDocumentBlocks}
      isNotebook={isNotebook}
      getNotebook={getNotebook}
    />
  ) : (
    <EditorGuest documentId={documentId} />
  )
}

export default EditorHandler
