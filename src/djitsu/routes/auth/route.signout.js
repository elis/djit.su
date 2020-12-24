import React, { useState, useEffect, useCallback } from 'react'
import AuthLayout from './auth-layout'
import { useHistory } from 'react-router-dom'
import { useTimeout } from 'ahooks'

import {
  HomeOutlined,
  LogoutOutlined,
  SolutionOutlined
} from '@ant-design/icons'

import { Button } from 'antd'
import { useDispatcher, useSelector } from 'djitsu/store'
import { useUser } from 'djitsu/providers/user'
import signOut from 'djitsu/store/auth/thunks/signout'
import useStatusTasks from './use-status-tasks'
import AuthStatus from './auth-layout.status'

export const Signout = () => {
  const history = useHistory()
  const [userState] = useUser()

  const [loading, setLoading] = useState(true)

  const [isReady, setIsReady] = useState()

  const goto = useCallback((path) => {
    history.push(path)
  }, [])

  const storeActions = useDispatcher({
    signOut
  })

  const initialized = useSelector(({ auth: { initialized } }) => initialized)

  const [statusProps, taskActions, resetTasks] = useStatusTasks({
    taskLabels: {
      cookies: 'Clear cookies',
      token: 'Invalidated access credentials',
      application: 'Clear application memory',
      wipe: 'Wipe and dust servers',
      message: 'Preparing goodbye message'
    },
    taskDescriptions: {
      username: 'Your username of choice is being created...'
    },
    tasks: {
      cookies: AuthStatus.STARTED,
      token: AuthStatus.PENDING,
      application: AuthStatus.PENDING,
      wipe: AuthStatus.PENDING,
      message: AuthStatus.PENDIN
    }
  })

  useEffect(() => {
    resetTasks()
    storeActions.signOut().then(() => {
      taskActions.setTask('cookies', AuthStatus.COMPLETE)
      setIsReady(true)
      taskActions.setTask('message', AuthStatus.PROGRESS)
      taskActions.setTaskProgress('message', 11)
    })
  }, [])
  useEffect(() => {
    if (!userState.currentUserID && initialized) history.push('/')
  }, [initialized])

  useTimeout(() => {
    taskActions.setTask('token', AuthStatus.STARTED)
    taskActions.setTask('message', AuthStatus.PROGRESS)
    taskActions.setTaskProgress('message', 27)
  }, 800)

  useTimeout(() => {
    taskActions.setTask('token', AuthStatus.COMPLETE)
    taskActions.setTask('application', AuthStatus.STARTED)
    taskActions.setTaskProgress('message', 52)
  }, 800 + 800)

  useTimeout(() => {
    taskActions.setTask('application', AuthStatus.COMPLETE)
    taskActions.setTask('wipe', AuthStatus.STARTED)
    taskActions.setTaskProgress('message', 79)
  }, 800 + 800 + 800)

  useTimeout(() => {
    taskActions.setTask('wipe', AuthStatus.COMPLETE)
    taskActions.setTaskProgress('message', 94)
  }, 800 + 800 + 8100 + 800)

  useTimeout(() => {
    taskActions.setTask('message', AuthStatus.COMPLETE)
  }, 800 + 800 + 8100 + 800 + 800)

  useTimeout(() => {
    setLoading(false)
    setIsReady(true)
  }, 800 + 800 + 8100 + 800 + 800 + 800)

  return (
    <AuthLayout
      loading={
        loading ? (
          <AuthLayout.Loading
            icon={<LogoutOutlined />}
            title={'Signout'}
            subTitle={
              !userState?.currentUsername ? (
                <>Depackaging packages...</>
              ) : (
                <>
                  Thanks for visiting{' '}
                  <strong>
                    {statusProps.status[2] === AuthStatus.COMPLETE
                      ? userState?.currentUsername?.replace?.(
                          /[a-z0-9]/gi,
                          () => '#'
                        )
                      : userState?.currentUsername}
                  </strong>
                  , we hope to see you again soon!
                </>
              )
            }
            extra={<AuthLayout.Status {...statusProps} />}
          />
        ) : null
      }
    >
      {!loading && isReady && (
        <>
          <AuthLayout.Result
            title='Signed Out'
            extra={[
              <Button key='home' onClick={() => goto('/')}>
                <HomeOutlined />
                Home
              </Button>,
              <Button key='new-account' onClick={() => goto('/login')}>
                <SolutionOutlined />
                Login
              </Button>
            ]}
            redirectTo='/'
            redirectDuration={130}
            redirectMessage='Redirecting home in %SECONDS%...'
          />
        </>
      )}
    </AuthLayout>
  )
}

export default Signout
