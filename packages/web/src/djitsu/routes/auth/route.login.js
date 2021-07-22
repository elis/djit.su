import React, { useState, useEffect, useRef, useCallback } from 'react'
import AuthLayout from './auth-layout'
import { Link, useHistory } from 'react-router-dom'

import {
  AuditOutlined,
  SmileOutlined,
  BookOutlined,
  FileAddOutlined
} from '@ant-design/icons'

import { Form, Button } from 'antd'
import {
  EmailField,
  PasswordField,
  RememberMeField,
  SocialSigninField
} from './fields'
import { useDispatcher } from 'djitsu/store'
import emailSignin from 'djitsu/store/auth/thunks/email-signin'
import { useUser } from 'djitsu/providers/user'
import providerSignin from 'djitsu/store/auth/thunks/provider-signin'
import useStatusTasks from './use-status-tasks'
import AuthStatus from './auth-layout.status'
import { useDebounce } from 'ahooks'
import { ProviderID } from 'djitsu/schema/auth'

export const Login = () => {
  const history = useHistory()
  const [userState] = useUser()

  const [loading, setLoading] = useState(false)
  const [delayedLoading, setDelayedLoading] = useState(false)
  const debouncedLoading = useDebounce(loading, { wait: 4100 })
  const [signinError, setSigninError] = useState({})
  const [isComplete, setIsComplete] = useState()
  const [isRememberMe, setRememberMe] = useState(true)
  const [redirectTo, setRedirectTo] = useState()
  const delayedRedirectTo = useDebounce(redirectTo, { wait: 2200 })

  const smartAssed = useRef(
    smartAss[Math.floor(Math.random() * 1000) % (smartAss.length - 1)]
  )

  const storeActions = useDispatcher({
    emailSignin,
    providerSignin
  })

  const [statusProps, { setTask }, resetTasks] = useStatusTasks({
    taskLabels: {
      verify: 'Verify account credentials',
      account: 'Load user account',
      signin: 'Returning to account signin',
      username: 'Username not found',
      signup: 'Redirecting to signup',
      compelete: 'Signin complete',
      [ProviderID.google]: 'Accessing google servers',
      [ProviderID.github]: 'Retreiving github account'
    }
  })

  const rememberMeUpdated = (event) => {
    const {
      target: { checked }
    } = event
    setRememberMe(checked)
  }

  const onFinish = useCallback(async (values) => {
    setLoading(true)
    setSigninError()

    resetTasks()
    setTask('verify', AuthStatus.STARTED)
    setTask('account', AuthStatus.PENDING)

    try {
      await storeActions.emailSignin(
        values.email,
        values.password,
        values.remember
      )
      setTask('verify', AuthStatus.COMPLETE)
      setTask('account', (v) =>
        v !== AuthStatus.COMPLETE ? AuthStatus.STARTED : v
      )
      setTask('compelete', AuthStatus.STARTED)

      setIsComplete(true)
    } catch (error) {
      setSigninError(error)

      setTask('verify', AuthStatus.ERROR)
      setTask('account', AuthStatus.CANCELED)
      setTask('signin', AuthStatus.STARTED)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (userState.currentUserID && userState.currentUsername) {
      setIsComplete(true)
      setTask('account', AuthStatus.COMPLETE)
      setTask('compelete', AuthStatus.STARTED)
    } else if (userState.currentUserID && !userState.currentUsername) {
      setTask('account', AuthStatus.CANCELED)
      setTask('signup', AuthStatus.STARTED)
      setRedirectTo('/signup')
    }
  }, [userState])

  useEffect(() => {
    if (delayedRedirectTo) history.push(delayedRedirectTo)
  }, [delayedRedirectTo])

  const socialSignin = useCallback(
    (provider) => async () => {
      setLoading(true)
      setDelayedLoading(true)
      setSigninError()

      resetTasks()
      setTask(provider, AuthStatus.STARTED)
      setTask('verify', AuthStatus.PENDING)
      setTask('account', AuthStatus.PENDING)

      try {
        await storeActions.providerSignin(provider, isRememberMe)

        setTask(provider, AuthStatus.COMPLETE)
        setTask('verify', AuthStatus.COMPLETE)
        setTask('account', (v) =>
          v !== AuthStatus.COMPLETE ? AuthStatus.STARTED : v
        )
      } catch (error) {
        setSigninError(error)

        setTask(provider, AuthStatus.ERROR)
        setTask('verify', AuthStatus.CANCELED)
        setTask('account', AuthStatus.CANCELED)
        setTask('signin', AuthStatus.STARTED)
      }
      setLoading()
    },
    [isRememberMe]
  )

  useEffect(() => {
    if (!debouncedLoading) {
      setDelayedLoading(false)
    }
  }, [debouncedLoading])

  const goto = useCallback((path) => {
    history.push(path)
  }, [])

  return (
    <AuthLayout
      loading={
        loading || delayedLoading ? (
          <AuthLayout.Loading
            icon={<AuditOutlined />}
            title={'Login'}
            subTitle='Processing your request...'
            extra={<AuthLayout.Status {...statusProps} />}
          />
        ) : null
      }
    >
      {isComplete ? (
        <AuthLayout.Result
          icon={<SmileOutlined />}
          title={<>Welcome back, {userState.currentUsername}!</>}
          subTitle={smartAssed.current}
          redirectTo='/home'
          redirectDuration={18}
          extra={
            <>
              <Button
                type='primary'
                key='create'
                onClick={() => goto('/create-new')}
              >
                <FileAddOutlined />
                New Document
              </Button>
              <Button key='notebooks' onClick={() => goto('/notebooks')}>
                <BookOutlined />
                Notebooks
              </Button>
            </>
          }
        />
      ) : (
        <>
          <h1>Sign In</h1>
          <Form
            name='basic'
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <EmailField
              error={signinError?.code?.match(/^auth\/user/) && signinError}
            />
            <PasswordField
              error={
                signinError?.code?.match(/^auth\/.*password/) && signinError
              }
            />

            {!userState.currentUserID && (
              <RememberMeField onChange={rememberMeUpdated} />
            )}

            <Form.Item>
              <Button type='primary' htmlType='submit' block>
                Login
              </Button>
            </Form.Item>

            <Form.Item>
              <Button type='default' className='create-account-button' block>
                <Link to='/signup'>Create an account</Link>
              </Button>
            </Form.Item>

            {!userState.currentUserID && (
              <SocialSigninField
                socialSignin={socialSignin}
                error={
                  (signinError?.code === 'auth/popup-blocked' ||
                    signinError?.code ===
                      'auth/account-exists-with-different-credential') &&
                  signinError
                }
              />
            )}
          </Form>
        </>
      )}
    </AuthLayout>
  )
}

const smartAss = [
  `We've missed your creative touch`,
  `Your presence was notably absent`,
  `Our records have missed your activity`
]

export default Login
