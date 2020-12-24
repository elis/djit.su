import React, { useState, useEffect, useCallback } from 'react'
import AuthLayout from './auth-layout'
import { Link, useHistory } from 'react-router-dom'

import { AuditOutlined, FileAddOutlined, HomeOutlined } from '@ant-design/icons'

import { Form, Button } from 'antd'
import { useDispatcher } from 'djitsu/store'
import checkUsername from 'djitsu/store/user/thunks/check-username'
import createEmailAccount from 'djitsu/store/auth/thunks/create-email-account'
import createUser from 'djitsu/store/user/thunks/create-user'
import seedUserAccount from 'djitsu/store/user/thunks/seed-user-account'
import { useUser } from 'djitsu/providers/user'
import AuthStatus from './auth-layout.status'
import {
  EmailField,
  PasswordField,
  UsernameField,
  RememberMeField,
  SocialSigninField,
  SocialUserField
} from './fields'
import providerSignin from 'djitsu/store/auth/thunks/provider-signin'
import { ProviderID } from 'djitsu/schema/auth'
import useStatusTasks from './use-status-tasks'

export const Signup = () => {
  const history = useHistory()
  const [userState] = useUser()

  const [form] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [signinError, setSigninError] = useState()
  const [userAuthenticated, setUserAuthenticated] = useState()
  const [isRememberMe, setRememberMe] = useState(true)

  const [isComplete, setIsComplete] = useState()
  const [isReady, setIsReady] = useState()

  const [
    statusProps,
    { setTask, setTaskProgress },
    resetTasks
  ] = useStatusTasks({
    taskLabels: {
      account: 'Create account',
      profile: 'Create user profile',
      username: 'Create username',
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

  const goto = useCallback((path) => {
    history.push(path)
  }, [])

  const storeActions = useDispatcher({
    createEmailAccount,
    createUser,
    checkUsername,
    seedUserAccount,
    providerSignin
  })

  const checkUsernameAvailability = async (value) => {
    const available = await storeActions.checkUsername(value)

    if (!available || value === 'test') {
      throw {
        code: 'user/username-unavailable',
        message: 'Username is not available'
      }
    }
    return true
  }

  const seedAccount = useCallback(async (username) => {
    const seedRes = await storeActions.seedUserAccount(username)
    return seedRes
  }, [])

  const onFinish = async (values) => {
    setLoading(true)
    setSigninError()
    resetTasks()

    if (userAuthenticated) {
      // Just username
      setTask('username', AuthStatus.STARTED)
      try {
        await storeActions.createUser(userAuthenticated, values.username)
        setTask('username', AuthStatus.PROGRESS)
        setTaskProgress('username', 30)
        await new Promise((resolve) => setTimeout(() => resolve(), 1200))
        setTask('username', AuthStatus.PROGRESS)
        setTaskProgress('username', 100)
        await seedAccount(values.username)
      } catch (error) {
        setSigninError(error)
      }
    } else {
      // Account from scratch
      try {
        setTask('account', AuthStatus.STARTED)
        setTask('username', AuthStatus.PENDING)
        setTaskProgress('account', 10)
        await new Promise((resolve) => setTimeout(() => resolve(), 800))
        const res = await storeActions.createEmailAccount(
          values.email,
          values.password,
          values.remember
        )
        await new Promise((resolve) => setTimeout(() => resolve(), 300))
        setTask('account', AuthStatus.PROGRESS)
        setTaskProgress('account', 30)
        setTask('username', AuthStatus.STARTED)
        setUserAuthenticated(res.uid)

        await storeActions.createUser(res.uid, values.username)
        setTaskProgress('account', 60)
        setTaskProgress('username', 30)
        await new Promise((resolve) => setTimeout(() => resolve(), 1200))

        await seedAccount(values.username)
      } catch (error) {
        setSigninError(error)
      }
    }

    setLoading(false)
    setIsReady(true)
  }

  useEffect(() => {
    if (userState.currentUserID && userState.currentUsername && !isComplete) {
      setIsComplete(true)
      if (!loading && !isReady && userState.profile) {
        setIsReady(true)
      } else if (!loading && !isReady && !userState.profile) {
        setLoading(true)
        setTask('profile', AuthStatus.STARTED)
        seedAccount(userState.currentUsername).then(() => {
          setTask('profile', AuthStatus.COMPLETE)
          setLoading(false)
          setIsReady(true)
        })
      }
    }
  }, [userState, isComplete, isReady, loading])

  useEffect(() => {
    if (!userAuthenticated && userState.currentUserID) {
      setUserAuthenticated(userState.currentUserID)
    }
  }, [userAuthenticated, userState.currentUserID])

  const socialSignin = useCallback(
    (provider) => async () => {
      setLoading(true)
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

  return (
    <AuthLayout
      form={form}
      noFooter={userState.currentUserID && !userState.currentUsername}
      loading={
        loading && (
          <AuthLayout.Loading
            icon={<AuditOutlined />}
            title={'Signup'}
            subTitle='Processing your request...'
            extra={<AuthLayout.Status {...statusProps} />}
          />
        )
      }
    >
      {isReady && isComplete ? (
        <>
          <AuthLayout.Result
            title='Account Created'
            subTitle={
              <>
                Welcome to djitsu, <strong>{userState.currentUsername}</strong>!
                🎈🥳
                <br />
                Now go create a new document and do something awesome!
              </>
            }
            extra={[
              <Button
                type='primary'
                key='create'
                onClick={() => goto('/create-new')}
              >
                <FileAddOutlined />
                New Document
              </Button>,
              <Button key='home' onClick={() => goto('/')}>
                <HomeOutlined />
                Home
              </Button>
            ]}
            redirectTo='/notebooks'
            redirectDuration={150}
            redirectMessage='Redirecting home in %SECONDS%...'
          />
        </>
      ) : (
        <>
          <h1>Create Account</h1>
          <Form
            name='signup'
            initialValues={{ remember: true }}
            onFinish={onFinish}
            form={form}
          >
            {userAuthenticated && <SocialUserField />}

            <UsernameField
              error={
                (signinError?.code?.match(/^auth\/user/) ||
                  userAuthenticated) &&
                signinError
              }
              checkUsername={checkUsernameAvailability}
            />

            {!userAuthenticated && (
              <EmailField
                error={signinError?.code?.match(/^auth\/email/) && signinError}
              />
            )}

            {!userAuthenticated && (
              <PasswordField
                verify
                error={
                  signinError?.code?.match(/^auth\/.*password/) && signinError
                }
              />
            )}
            {!userAuthenticated && (
              <PasswordField
                verify
                repeat
                error={
                  signinError?.code?.match(/^auth\/.*password/) && signinError
                }
              />
            )}

            {!userState.currentUserID && (
              <RememberMeField onChange={rememberMeUpdated} />
            )}

            <Form.Item>
              <Button type='primary' htmlType='submit' block>
                Continue
              </Button>
            </Form.Item>

            {!userState.currentUserID && (
              <Form.Item>
                <Button type='default' className='login-button' block>
                  <Link to='/login'>Log in instead</Link>
                </Button>
              </Form.Item>
            )}

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

export default Signup
