import React, { useRef, useEffect, useState, useCallback } from 'react'
import IframeResizer from 'iframe-resizer-react'
import styled from 'styled-components'
import useMessage from '../use-message'
import { useTheme } from 'djitsu/theme'
import { NotebookError } from 'djitsu/schema/notebook'
import hash from 'object-hash'

export const IFrameHost = (props) => {
  const {
    notebook,
    onChange,
    documentId,
    newDocumentBlocks,
    isNotebook,
    getNotebook
  } = props
  const iframeRef = useRef()
  const srcRef = useRef()

  const [isSourceReady, setSourceReady] = useState()
  const [isBootstrapComplete, setBootstrapComplete] = useState()
  const [isNotebookReady, setNotebookReady] = useState()
  const [{ theme }] = useTheme()

  const freshRef = useRef()
  const getFresh = () => freshRef.current
  useEffect(() => {
    freshRef.current = { isNotebook, getNotebook }
  }, [isNotebook, getNotebook])

  const onMessage = async (event, message) => {
    if (message?.type === 'document-updated') {
      onChange?.(message.payload)
    }
    if (message?.type === 'late-init') {
      setNotebookHash(null)
      setBootstrapComplete(false)
      setTimeout(() => setBootstrapComplete(true), 20)
    }
    if (message?.type === 'bootstrap-complete') {
      setBootstrapComplete(true)
    }
    const { isNotebook, getNotebook } = getFresh()
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
  const msgRef = useRef()
  const getMessaging = () => msgRef.current
  useEffect(() => {
    msgRef.current = messaging
  }, [messaging])

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
        // setSourceReady((v) => {
        //   // console.log('current source ready state', v)
        //   if (v) {
        //     setTimeout(() => setSourceReady(true), 2)
        //     return false
        //   }
        //   return true
        // })
        setSourceReady(true)
      }
    }
  }, [iframeRef, isSourceReady, srcRef, iframeRef.current])

  useEffect(() => {
    srcRef.current = null
  }, [documentId])

  const setFailedToBootstrap = async () => {
    if (!isBootstrapComplete) {
      setSourceReady()
      await new Promise((r) => setTimeout(r, 100))
      setSourceReady(true)
    }
  }

  const REBOOT_AFTER = 10000
  const BOOTSTRAP_INTERVAL = 300
  const [bootstart, setBootstart] = useState()
  const [bootend, setBootend] = useState()
  const [lastNotebookHash, setNotebookHash] = useState()

  const sendNotebookToGuest = useCallback(
    async (sendingNotebook) => {
      const unavailable = !(
        sendingNotebook.status?.error !== NotebookError.Unavailable ||
        sendingNotebook.blocks?.length
      )
      const msg = {
        type: 'notebook-updated',
        notebook: !unavailable
          ? sendingNotebook
          : {
              blocks: [...newDocumentBlocks],
              meta: {
                blocksTime: Date.now()
              }
            }
      }
      const hashed = hash(msg)
      if (!lastNotebookHash || hashed !== lastNotebookHash) {
        // console.log('📜 Sending Notebook To Guest!', sendingNotebook)
        getMessaging()
          .sendMessage(msg)
          .then((result) => {
            // console.log('🌅 result of notebook update:', result)
            if (!result || !result.success) {
              console.log('🌅 Unexpected notebook-update response:', result)
            }
          })
        setNotebookHash(hashed)
      }
    },
    [lastNotebookHash]
  )

  useEffect(() => {
    let unmounted = false
    // eslint-disable-next-line prettier/prettier
    // console.log('🍟 Bootstrap Checks', { isSourceReady, isBootstrapComplete, bootstart })
    if (isSourceReady && !isBootstrapComplete) {
      // console.log('±±± BOOTSTRAP START ±±±', { bootstart, REBOOT_AFTER })

      if (!bootstart) setBootstart(Date.now())

      const tid = setTimeout(() => {
        // console.log('±±± BOOTSTRAP TIMEOUT CHECK ±±±')
        if (!unmounted) {
          setFailedToBootstrap(true)
        }
      }, REBOOT_AFTER)

      messaging.sendMessage({ type: 'bootstrap' }, 250).then((response) => {
        // console.log('±±± BOOTSTRAP RESPONSE RECEIVED ±±±', { response })
        if (response?.success) {
          // console.log('±±± BOOTSTRAP RESPONSE SUCCESS ±±±', response.success)
          clearTimeout(tid)
          if (!unmounted) {
            setBootstrapComplete(true)
            setBootend(Date.now())
          }
        } else {
          // console.log('±±± BOOTSTRAP RESPONSE FAILED - Resetting ±±±')
          setSourceReady(false)
          const etid = setTimeout(() => setSourceReady(true), 50)
          return () => clearTimeout(etid)
        }
      })

      return () => {
        unmounted = true
        // console.log('±±± BOOTSTRAP TIMEOUT CHECK CANCELED ±±±')
        clearTimeout(tid)
      }
    }
  }, [isSourceReady, isBootstrapComplete])

  useEffect(() => {
    if (bootstart && !bootend) {
      // console.log('😈 😈 starting bootstrap timeout', BOOTSTRAP_INTERVAL)
      const tid = setTimeout(() => {
        // console.log('😈 😈 trying again')
        setBootend(true)
      }, BOOTSTRAP_INTERVAL)
      return () => clearTimeout(tid)
    }
    // console.log('😈 😈 starting bootstrap timeout', BOOTSTRAP_INTERVAL)
  }, [bootstart])

  useEffect(() => {
    if (bootstart && bootend && !isBootstrapComplete) {
      // console.log('📜 Boot ended - no bootstrap complete')
      setSourceReady(false)
      setTimeout(() => setSourceReady(true), 12)
    }
  }, [bootstart, bootend])

  useEffect(() => {
    if (notebook) {
      if (!isNotebookReady) {
        setNotebookReady(true)
      }
      if (isSourceReady && isBootstrapComplete) {
        // console.log('📜 Source Ready - send notebook!')
        sendNotebookToGuest(notebook)
      }
    }
  }, [notebook, isSourceReady, isBootstrapComplete])

  useEffect(() => {
    setSourceReady(false)
    setBootstrapComplete(false)
  }, [theme])

  // useEffect(() => {
  //   if (isNotebookReady && isSourceReady && isBootstrapComplete) {
  //     sendNotebookToGuest(notebook)
  //   }
  // }, [isNotebookReady, isSourceReady, isBootstrapComplete])

  return (
    <StyledIFrame
      heightCalculationMethod='taggedElement'
      forwardRef={iframeRef}
      src={props.src}
      onMessage={onMessage}
      onResized={onResized}
    />
  )
}

const StyledIFrame = styled(IframeResizer)`
  border: none;
  width: 100%;
`

export default IFrameHost
