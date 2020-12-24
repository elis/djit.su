import React from 'react'
import { useTheme } from 'djitsu/theme'
import { ssr } from 'djitsu/utils/ssr'
import RunnerHandler from './runner-handler'
import EditorHandler from './editor-handler'

export const DocumentIFrame = (props) => {
  const {
    documentId,
    notebook,
    isHost,
    isEditor,
    onChange,
    newDocumentBlocks,
    exported,
    isNotebook,
    getNotebook
  } = props
  const [{ theme }] = useTheme()

  return ssr ? (
    <>Loading...</>
  ) : isEditor ? (
    <EditorHandler
      {...{
        theme,
        documentId,
        notebook,
        isHost,
        onChange,
        isNotebook,
        getNotebook,
        newDocumentBlocks
      }}
    />
  ) : (
    <RunnerHandler
      {...{
        theme,
        documentId,
        notebook,
        isHost,
        onChange,
        exported,
        isNotebook,
        getNotebook
      }}
    />
  )
}

export default DocumentIFrame
