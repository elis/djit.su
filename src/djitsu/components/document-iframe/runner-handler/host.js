import React, { useRef, useEffect, useState } from 'react'
import IframeResizer from 'iframe-resizer-react'
import styled from 'styled-components'
import useMessage from '../use-message'
import { useTheme } from 'djitsu/theme'
import { NotebookError } from 'djitsu/schema/notebook'

export const IFrameHost = (props) => {
  const {
    notebook,
    onChange,
    documentId,
    newDocumentBlocks,
    exported,
    isNotebook,
    getNotebook
  } = props
  const iframeRef = useRef()
  const srcRef = useRef()

  const [isSourceReady, setSourceReady] = useState()
  const [isBootstrapComplete, setBootstrapComplete] = useState()
  const [isNotebookReady, setNotebookReady] = useState()
  const [{ theme }] = useTheme()
  const [bootstart, setBootstart] = useState()
  const [reboot, setReboot] = useState()

  const onMessage = (event, message) => {
    if (message?.type === 'document-updated') {
      onChange?.(message.payload)
    }
    if (message?.type === 'bootstrap-complete') {
      setBootstrapComplete(true)
    }
    if (message?.type === 'is-notebook') {
      return isNotebook?.(
        message.payload.username,
        message.payload.notebookName,
        message.payload.version
      )
    }
    if (message?.type === 'get-notebook') {
      return getNotebook?.(
        message.payload.username,
        message.payload.notebookName,
        message.payload.version
      )
    }
  }

  const messaging = useMessage({
    isHost: true,
    srcRef: srcRef,
    onMessage
  })

  const onResized = () => ({})

  useEffect(() => {
    if (
      iframeRef.current?.iframeRef?.current &&
      (!srcRef.current ||
        srcRef.current !== iframeRef.current?.iframeRef?.current)
    ) {
      srcRef.current = iframeRef.current?.iframeRef?.current
      srcRef.current.onload = (k) => {
        srcRef.current = k.target
        setSourceReady((v) => {
          if (v) {
            setTimeout(() => setSourceReady(true), 2)
            return false
          }
          return true
        })
      }
    }
  }, [iframeRef, isSourceReady, srcRef, iframeRef.current])

  useEffect(() => {
    srcRef.current = null
  }, [documentId])

  const setFailedToBootstrap = () => {
    if (!isBootstrapComplete) {
      setSourceReady()
      setTimeout(() => {
        setSourceReady(true)
      }, 50)
    }
  }

  const REBOOT_IFRAME_AFTER = 3000

  useEffect(() => {
    if (isSourceReady && !isBootstrapComplete) {
      // console.log('±±± BOOTSTRAP START ±±±')
      messaging.sendMessage({ type: 'bootstrap' })
      if (!bootstart) setBootstart(Date.now())
      if (bootstart + REBOOT_IFRAME_AFTER >= Date.now()) {
        setSourceReady(false)
        setReboot(true)
      }
      const tid = setTimeout(() => {
        // console.log('±±± BOOTSTRAP TIMEOUT CHECK ±±±')
        setFailedToBootstrap(true)
      }, 300)
      return () => {
        // console.log('±±± BOOTSTRAP TIMEOUT CHECK CANCELED ±±±')
        clearTimeout(tid)
      }
    }
  }, [isSourceReady, isBootstrapComplete])

  useEffect(() => {
    if (reboot) {
      console.log('[ ] Rebooting iframe...')
      const tid = setTimeout(() => {
        console.log('[ ] Reboot complete.')
        setReboot(false)
      }, 50)
      return () => clearTimeout(tid)
    }
  }, [reboot])

  useEffect(() => {
    if (notebook) {
      if (!isNotebookReady) {
        setNotebookReady(true)
      }
      if (isSourceReady && isBootstrapComplete) {
        messaging.sendMessage({
          type: 'notebook-updated',
          notebook
        })
      }
    }
  }, [notebook])

  useEffect(() => {
    if (exported) {
      if (isSourceReady && isBootstrapComplete) {
        messaging.sendMessage({
          type: 'exported-updated',
          exported
        })
      }
    }
  }, [exported, isSourceReady, isBootstrapComplete])

  useEffect(() => {
    setSourceReady(false)
    setBootstrapComplete(false)
  }, [theme])

  useEffect(() => {
    if (
      isNotebookReady &&
      isSourceReady &&
      isBootstrapComplete &&
      notebook &&
      (notebook.status?.error !== NotebookError.Unavailable ||
        notebook.blocks?.length)
    ) {
      // console.log('💾💽 SENDING EXISTING BLOCKS', notebook)

      const msg = {
        type: 'notebook-updated',
        notebook
      }
      messaging.sendMessage(msg)
    } else if (isNotebookReady && isSourceReady && isBootstrapComplete) {
      // console.log('💾💽 SENDING NEW BLOCKS', notebook)
      const msg = {
        type: 'notebook-updated',
        notebook: {
          blocks: [...newDocumentBlocks],
          meta: {
            blocksTime: Date.now()
          }
        }
      }
      messaging.sendMessage(msg)
    }
  }, [isNotebookReady, isSourceReady, isBootstrapComplete])

  return (
    !reboot && (
      <StyledIFrame
        heightCalculationMethod='taggedElement'
        forwardRef={iframeRef}
        src={props.src}
        onMessage={onMessage}
        onResized={onResized}
      />
    )
  )
}

const StyledIFrame = styled(IframeResizer)`
  border: none;
  width: 100%;
`

export default IFrameHost
