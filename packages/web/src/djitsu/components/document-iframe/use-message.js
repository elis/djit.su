import { useEffect, useRef } from 'react'
import { RAZZLE_USER_CONTENT_URL } from 'djitsu/utils/env'
import hashString from 'djitsu/utils/hash-string'
import { useMap } from 'ahooks'

const DEBUG = false

const GUEST_HOST = ['guest', 'host']
const ASYNC_RESPONSE_TIMEOUT = 60 * 1000

export const useMessage = (opts = {}) => {
  const { isGuest, isHost, onMessage: onMessageUser, srcRef: srcRefUser } = opts
  const srcRef = useRef()

  const [
    asyncMessages,
    { set: setMessage, remove: removeMessage, get: getMessage }
  ] = useMap()

  const asyncMessageRef = useRef()
  /**
   * @returns {[asyncMessage, getMessage, setMessage, onMessageUser]}
   */
  const getFreshMessages = () => asyncMessageRef.current
  useEffect(() => {
    let unmounted = false
    const _setMessage = (...args) => {
      if (!unmounted) return setMessage(...args)
    }
    asyncMessageRef.current = [
      asyncMessages,
      getMessage,
      _setMessage,
      onMessageUser
    ]

    return () => {
      unmounted = true
    }
  }, [asyncMessages, getMessage, setMessage, onMessageUser])

  const asyncMessage = async (tag, timeout = ASYNC_RESPONSE_TIMEOUT) => {
    const started = Date.now()
    const end = started + timeout
    const interval = 13

    let attempts = 0
    // console.log('⏱📧 Async Message', { tag, timeout })

    while (Date.now() < end) {
      const [, getMessage] = getFreshMessages()
      const message = getMessage(tag)
      if (!message) {
        await new Promise((r) => {
          setTimeout(r, ++attempts * interval)
        })
      } else {
        removeMessage(tag)
        const { result } = message || {}
        return result
      }
    }
    removeMessage(tag)
  }

  const sendMessage = async (message, responseTag, timeout) => {
    const msg = JSON.stringify(message)
    const messageHash =
      hashString(msg + Date.now().toString(32)) +
      hashString(msg + Math.ceil(Date.now() / 3).toString(32))

    DEBUG &&
      (console.groupCollapsed(
        '>>> >>> >>> MESSAGE SENDING',
        `[ ${isHost ? 'HOST' : 'GUEST'} ]`,
        `[ ${!responseTag ? 'POST' : 'RESPONSE'} ]`,
        `[ ${(isHost ? [...GUEST_HOST].reverse() : GUEST_HOST).join(
          ' --> '
        )} ]`,
        `[ ${messageHash}${responseTag ? ` -> ${responseTag}` : ''} ]`,
        msg.match(/^(.{0,50})/)[0] + (msg.length > 50 ? '...' : '')
      ) ||
        console.log({
          message
        }) ||
        console.groupEnd())
    if (isGuest) {
      if (srcRef.current) {
        if (responseTag) {
          const post = () =>
            srcRef.current.postMessage(
              `djitsu:message-response:${responseTag}:${messageHash}:${msg}`,
              '*'
            )
          post()
          // setTimeout(post, 20)
          // setTimeout(post, 80)
        } else {
          srcRef.current.postMessage(
            `djitsu:message:${messageHash}:${msg}`,
            '*'
          )
          const result = await asyncMessage(messageHash, timeout)

          return result
        }
      } else {
        console.log('⁄⁄⁄LACKING SRC REF - CANNOT SEND MESSAGE TO HOST')
      }
    } else if (isHost) {
      if (srcRefUser?.current) {
        if (responseTag) {
          const post = () =>
            srcRefUser.current?.contentWindow?.postMessage?.(
              `djitsu:message-response:${responseTag}:${messageHash}:${msg}`,
              RAZZLE_USER_CONTENT_URL
            )
          post()
          // setTimeout(post, 20)
          // setTimeout(post, 80)
        } else {
          srcRefUser.current?.contentWindow?.postMessage?.(
            `djitsu:message:${messageHash}:${msg}`,
            RAZZLE_USER_CONTENT_URL
          )
          const result = await asyncMessage(messageHash, timeout)

          return result
        }
      }
    }
  }

  const unpack = (msg) => {
    return JSON.parse(msg)
  }

  const onMessage = (event) => {
    const message = event.data
    if (!srcRef.current) srcRef.current = event.source

    const [, tag, packed] =
      message?.match?.(/^djitsu:message:([^:]{5,29}):(.*)$/) || []

    const [, responseTag, messageTag, packedResponse] =
      message?.match?.(
        /^djitsu:message-response:([^:]{5,29}):([^:]{5,29}):(.*)$/
      ) || []

    // Async message
    if (!responseTag && tag && packed) {
      const unpacked = unpack(packed)
      DEBUG &&
        (console.groupCollapsed(
          '<<< <<< <<< ASYNC MESSAGE RECEIVED',
          `[ ${isHost ? 'HOST' : 'GUEST'} ]`,
          `[ ${(isHost ? [...GUEST_HOST].reverse() : GUEST_HOST).join(
            ' <-- '
          )} ]`,
          `[ ${tag} ]`,
          unpacked?.type
        ) ||
          console.log({ unpacked }) ||
          console.groupEnd())

      if (typeof onMessageUser === 'function') {
        const messageResult = onMessageUser({}, unpacked)
        // console.log('⁄⁄⁄ASYNC Await? - ', tag)
        if (typeof messageResult?.then === 'function') {
          // console.log('⁄⁄⁄ASYNC Is Await - ', tag)
          messageResult.then((result) => {
            DEBUG &&
              (console.groupCollapsed(
                '<<< <<< <<< ASYNC MESSAGE RESPONSE',
                `[ ${isHost ? 'HOST' : 'GUEST'} ]`,
                `[ ${(isHost ? [...GUEST_HOST].reverse() : GUEST_HOST).join(
                  ' <-- '
                )} ]`,
                `[ ${tag} ]`,
                unpacked?.type
              ) ||
                console.log({ result }) ||
                console.groupEnd())

            // console.log('⁄⁄⁄ASYNC RESPONSE - ', tag, result)
            sendMessage({ type: 'async-response', response: result }, tag)
          })
        } else {
          // console.log('⁄⁄⁄ASYNC Not Await - ', tag)
          sendMessage({ response: null }, tag)
        }
      } else sendMessage({ type: 'async-response', response: null }, tag)
      // } else setMessage(tag, {})
    }

    // Async Response
    else if (responseTag && packedResponse) {
      // console.log('⁄⁄⁄ASYNC MSG RESPONSE - ', responseTag)
      const unpacked = unpack(packedResponse)
      DEBUG &&
        (console.groupCollapsed(
          '<<< <<< <<< ASYNC MESSAGE RESPONSE RECEIVED',
          `[ ${isHost ? 'HOST' : 'GUEST'} ]`,
          `[ ${(isHost ? [...GUEST_HOST].reverse() : GUEST_HOST).join(
            ' <-- '
          )} ]`,
          `[ ${responseTag}:${messageTag} ]`,
          unpacked?.type
        ) ||
          console.log({ unpacked }) ||
          console.groupEnd())

      const [, , setMessage] = getFreshMessages()
      const { response } = unpacked || {}
      setMessage(responseTag, { result: response })
    }
  }

  useEffect(() => {
    window.addEventListener('message', onMessage)
    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [])

  return {
    sendMessage: (message, timeout) => sendMessage(message, null, timeout)
  }
}

export default useMessage
