import React, { useEffect, useState } from 'react'
import Helmet from 'react-helmet'
import useMessage from '../use-message'
import NotebookRenderer from 'djitsu/components/notebook-renderer'
import { importHandlerMaker } from 'djitsu/compilers/javascript'
import CompileProvider from 'djitsu/providers/compile'
import compilers from 'djitsu/compilers'

export const IFrameGuest = (props) => {
  const [notebook, setNotebook] = useState()
  const [exported, setExported] = useState()
  const [isBootstrapped, setBootstrapped] = useState()

  const onMessage = (event, message) => {
    if (message?.type === 'bootstrap') {
      setBootstrapped(true)
    }
    if (message?.type === 'notebook-updated') {
      setNotebook(message.notebook)
    }
    if (message?.type === 'exported-updated') {
      setExported(message.exported)
    }
  }

  const messaging = useMessage({
    isGuest: true,
    onMessage
  })

  useEffect(() => {
    isBootstrapped &&
      messaging.sendMessage({ type: 'bootstrap-complete', klo: 'blue' })
  }, [isBootstrapped])

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
    isNotebook: ({ username, notebookName, version }) =>
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

  return (
    <>
      <CompileProvider loader={importHandler} compilers={compilers}>
        <Helmet>
          <title>Djitsu User Content</title>
          <script src='/vendors/iframe-resizer/iframeResizer.contentWindow.min.js' />
        </Helmet>
        <NotebookRenderer
          notebook={notebook}
          exported={exported}
          onChange={onDocumentChange}
          importHandler={importHandler}
        />
        {/* <pre>{JSON.stringify({ notebook, exported }, 1, 1)}</pre> */}
        {props.children}
      </CompileProvider>
    </>
  )
}

export default IFrameGuest
