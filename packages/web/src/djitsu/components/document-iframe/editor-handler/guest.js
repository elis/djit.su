import React, { useEffect, useRef, useState } from 'react'
import Helmet from 'react-helmet'
import useMessage from '../use-message'
import DocumentEditor from 'djitsu/components/document-editor'
import { importHandlerMaker } from 'djitsu/compilers/javascript'

export const IFrameGuest = (props) => {
  const [notebook, setNotebook] = useState()
  const notebookRef = useRef()

  const getNotebook = () => notebookRef.current
  useEffect(() => {
    notebookRef.current = notebook
  }, [notebook])

  const onMessage = async (event, message) => {
    if (message?.type === 'bootstrap') {
      return { success: true }
    }
    if (message?.type === 'notebook-updated') {
      setNotebook(message.notebook)
      return { success: true }
    }
  }

  const messaging = useMessage({
    isHost: false,
    isGuest: true,
    onMessage
  })
  const msgRef = useRef()
  const getMessaging = () => msgRef.current
  useEffect(() => {
    msgRef.current = messaging
  }, [messaging])

  const onDocumentChange = (newDocument) => {
    messaging.sendMessage({
      type: 'document-updated',
      payload: {
        ...newDocument,
        ...(newDocument.compiled && newDocument.compiled?.exports
          ? {
              compiled: {
                ...(newDocument.compiled || {}),
                exports: Object.keys(newDocument.compiled?.exports)
              }
            }
          : {})
      }
    })
  }

  const importHandler = importHandlerMaker({
    isNotebook: async ({ username, notebookName, version }) =>
      messaging.sendMessage({
        type: 'is-notebook',
        payload: {
          username,
          notebookName,
          version
        }
      }),
    getNotebook: ({ username, notebookName, version }) =>
      messaging.sendMessage({
        type: 'get-notebook',
        payload: {
          username,
          notebookName,
          version
        }
      })
  })

  useEffect(() => {
    if (!notebook) {
      const tid = setTimeout(() => {
        if (!getNotebook()) {
          getMessaging().sendMessage({
            type: 'late-init'
          })
        }
      }, 500)
      return () => clearTimeout(tid)
    }
  }, [notebook])

  return (
    <>
      <Helmet>
        <title>Djitsu User Content</title>
        <script src='/vendors/iframe-resizer/iframeResizer.contentWindow.min.js' />
      </Helmet>
      {!notebook && '🚕'}
      <DocumentEditor
        notebook={notebook}
        onChange={onDocumentChange}
        importHandler={importHandler}
      />
      {props.children}
    </>
  )
}

export default IFrameGuest
