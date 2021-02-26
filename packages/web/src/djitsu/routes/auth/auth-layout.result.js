import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Result, Divider, Progress } from 'antd'
import { HeartOutlined } from '@ant-design/icons'
import { Redirect } from 'djitsu/adapters/routes'
import useStates from 'djitsu/utils/hooks/use-states'

export const AuthResult = (props) => {
  const {
    title = 'Success!',
    subTitle,
    extra,
    redirectTo,
    redirectDuration = 60,
    redirectMessage = 'Redirecting you in %SECONDS% seconds...'
  } = props

  const [complete, setComplete] = useState(false) // redirect user to home
  const [redirectProgress, setRedirectProgress] = useState(0)
  const [redirectMessageParsed, setRedirectMessage] = useState()
  const startTime = useRef()
  const [resultValues, setResultValues] = useStates()

  const [_updateMessage, _setUpdateMessage] = useState()

  const parseRedirectMessage = useCallback(
    (re = /%([A-Z0-9]+)%/g) =>
      redirectMessage.replace(
        re,
        (match) => resultValues[[...match.matchAll(re)][0][1]]
      ),
    [resultValues, redirectMessage]
  )

  useEffect(() => {
    setRedirectMessage(parseRedirectMessage())
    _setUpdateMessage(false)
  }, [_updateMessage])

  // When form succeeds
  useEffect(() => {
    if (redirectTo) {
      const successNotificationTime = redirectDuration * 1000

      if (!startTime.current) {
        startTime.current = Date.now()
      }
      const iid = setInterval(() => {
        const val =
          Math.floor(
            ((Date.now() - startTime.current) /
              (successNotificationTime - 700)) *
              10000
          ) / 100
        setRedirectProgress(Math.min(100, val))
        setResultValues(
          'SECONDS',
          Math.floor(
            (successNotificationTime - (Date.now() - startTime.current)) / 1000
          )
        )
        _setUpdateMessage(true)
      }, 120)
      const tid = setTimeout(() => setComplete(true), successNotificationTime)
      return () => {
        clearTimeout(tid)
        clearInterval(iid)
      }
    }
  }, [redirectTo])

  return (
    <>
      <Result
        status='success'
        title={title}
        subTitle={subTitle}
        extra={extra}
      />
      {!!redirectTo && (
        <>
          {complete && <Redirect push to={redirectTo} />}
          <Divider orientation='center'>{redirectMessageParsed}</Divider>
          <Progress percent={redirectProgress} showInfo={false} />
          <Divider orientation='center'>
            <HeartOutlined />
          </Divider>
        </>
      )}
    </>
  )
}

export default AuthResult
