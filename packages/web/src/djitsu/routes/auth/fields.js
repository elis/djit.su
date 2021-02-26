import React, { useState } from 'react'
import { Form, Input, Tooltip, Checkbox, Button, Divider, Alert } from 'antd'
import AntIcon, {
  LockOutlined,
  MailOutlined,
  IdcardOutlined,
  CheckOutlined,
  LoadingOutlined,
  CloseOutlined,
  RetweetOutlined
} from '@ant-design/icons'

import Icon from '@mdi/react'
import { mdiGoogle, mdiGithub, mdiCloud } from '@mdi/js'

import { useAuthLayoutContext } from './auth-layout'
import { ProviderID } from 'djitsu/schema/auth'
import { useSelector } from 'djitsu/store'
import { useHistory } from 'react-router-dom'

export const EmailField = (props) => {
  const { error, loading } = props

  return (
    <Form.Item
      name='email'
      rules={[
        { required: true, message: 'Please enter email' },
        {
          type: 'email',
          message: 'Invalid email address'
        }
      ]}
      {...(error
        ? {
            validateStatus: error ? 'error' : undefined,
            help: error ? error.message : undefined
          }
        : {})}
    >
      <Input
        prefix={
          <MailOutlined style={{ opacity: 'var(--field-icon-opacity)' }} />
        }
        onChange={(...args) => props.onChange?.(...args)}
        placeholder='nikola@tesla.us'
        disabled={loading}
      />
    </Form.Item>
  )
}

export const PasswordField = (props) => {
  const [PRIMARY, REPEAT] = ['password', 'password-repeat']

  const { error, loading, repeat, verify } = props
  const [{ form }] = useAuthLayoutContext()

  const name = repeat ? REPEAT : PRIMARY
  const dependencies = repeat ? [REPEAT] : [PRIMARY]

  const rules = !verify
    ? [{ required: true, message: 'Please enter password' }]
    : repeat
    ? [
        { required: true, message: 'Please repeat password' },
        {
          type: 'matching',
          validator: async (rule, value) => {
            const primary = form.getFieldValue(PRIMARY)
            if (primary && value && value !== primary)
              throw new Error('Passwords must match')
          }
        }
      ]
    : [
        { required: true, message: 'Please enter password' },
        { min: 6, message: 'Password must be at least 6 characters long' },
        {
          pattern: /[a-z]+/i,
          message: 'Password must contain at least one English character'
        },
        {
          pattern: /[0-9]+/i,
          message: 'Password must contain at least one number'
        }
      ]

  return (
    <Form.Item
      name={name}
      dependencies={dependencies}
      rules={rules}
      {...(error
        ? {
            validateStatus: error ? 'error' : undefined,
            help: error ? error.message : undefined
          }
        : {})}
    >
      <Input.Password
        prefix={
          repeat ? (
            <RetweetOutlined style={{ opacity: 'var(--field-icon-opacity)' }} />
          ) : (
            <LockOutlined style={{ opacity: 'var(--field-icon-opacity)' }} />
          )
        }
        type='password'
        placeholder={(repeat ? 'Repeat ' : '') + 'Password'}
        disabled={loading}
      />
    </Form.Item>
  )
}

export const UsernameField = (props) => {
  const [{ form }] = useAuthLayoutContext()

  const [checked, setChecked] = useState({})

  const [value, setValue] = useState()
  const { onChange, checkUsername, error, loading, suggestingName } = props

  const onValueChange = ({ target: { value } }) => {
    onChange?.(value)
    setValue(value)
  }

  const updateChecked = (name, property, value) =>
    setChecked((v) => ({
      ...v,
      [name]:
        typeof property === 'string'
          ? { ...(v[name] || {}), [property]: value }
          : property
    }))

  const usernameValidator = async (rule, value) => {
    let errored
    if (!value) return true

    updateChecked(value, 'validating', true)
    updateChecked(value, 'available', false)
    try {
      await checkUsername(value)
      updateChecked(value, 'available', true)
    } catch (error) {
      errored = error
      updateChecked(value, 'available', false)
    }
    updateChecked(value, 'validating', false)
    updateChecked(value, 'validated', true)
    if (errored) throw errored
  }

  const current = checked[value]

  return (
    <Form.Item
      name='username'
      rules={[
        { required: true, message: 'Please enter username' },
        {
          pattern: /^[a-zA-Z0-9-_]+$/,
          message: 'Invalid characters in username'
        },
        { min: 3, message: 'Username too short' },
        { max: 300, message: 'Username too long...' },
        {
          type: 'unique',
          validator: usernameValidator
        }
      ]}
      {...(error
        ? {
            validateStatus: error ? 'error' : undefined,
            help: error ? error.message : undefined
          }
        : {})}
    >
      <Input
        prefix={
          <IdcardOutlined style={{ opacity: 'var(--field-icon-opacity)' }} />
        }
        placeholder='Username'
        disabled={loading || suggestingName}
        onChange={onValueChange}
        suffix={
          current?.validated && current?.available ? (
            <Tooltip title='Username is available'>
              <CheckOutlined style={{ color: 'var(--success-color)' }} />
            </Tooltip>
          ) : !!value && (current?.validating || suggestingName) ? (
            <LoadingOutlined />
          ) : !current?.available && !!value ? (
            <Tooltip title='Username is not available - Click to Clear'>
              <CloseOutlined
                onClick={() => {
                  form.resetFields(['username'])
                  setValue('')
                }}
                style={{ color: 'var(--error-color)' }}
              />
            </Tooltip>
          ) : null
        }
      />
    </Form.Item>
  )
}

export const RememberMeField = (props) => {
  return (
    <Form.Item
      name='remember'
      valuePropName='checked'
      onChange={props.onChange}
    >
      <Checkbox>Remember me</Checkbox>
    </Form.Item>
  )
}

// const anotherAccount = {
//   code: 'auth/account-exists-with-different-credential',
//   message:
//     'An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.',
//   a: null,
//   email: 'xxx.xxxxxx@gmail.com',
//   credential: {
//     a: null,
//     accessToken: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
//     providerId: 'github.com',
//     signInMethod: 'github.com'
//   }
// }

export const SocialSigninField = (props) => {
  const { socialSignin, error, remember } = props
  // const error = anotherAccount
  return (
    <>
      <Divider orientation='center'>
        <AntIcon component={() => <Icon path={mdiCloud} size={0.6} />} />
      </Divider>

      {error && error?.code === 'auth/popup-blocked' && (
        <Form.Item>
          <Alert
            message='Signin Popup Blocked'
            description='Your browser is blocking popups - enable popups for this website to signin with Google/Github'
            type='warning'
            showIcon
          />
        </Form.Item>
      )}

      {error &&
        error?.code === 'auth/account-exists-with-different-credential' && (
          <Form.Item>
            <Alert
              message='Account exists'
              description={
                <>
                  <p>{error.message}</p>
                  {!!error.email && <p>Email used: {error.email}</p>}
                </>
              }
              type='warning'
              showIcon
            />
          </Form.Item>
        )}

      <Form.Item className='social'>
        <Button
          type='default'
          className='google-button'
          block
          onClick={socialSignin(ProviderID.google, remember)}
          icon={
            <AntIcon
              component={() => (
                <Icon title='Google' path={mdiGoogle} size={0.6} />
              )}
            />
          }
        >
          Sign in with Google
        </Button>
      </Form.Item>
      <Form.Item className='social'>
        <Button
          type='default'
          className='github-button'
          block
          onClick={socialSignin(ProviderID.github, remember)}
          icon={
            <AntIcon
              component={() => (
                <Icon title='Github' path={mdiGithub} size={0.6} />
              )}
            />
          }
        >
          Sign in with Github
        </Button>
      </Form.Item>
    </>
  )
}

export const SocialUserField = () => {
  const history = useHistory()
  const { signinProvider, email } = useSelector(
    ({ auth: { signinProvider, credential } }) => ({
      signinProvider,
      email: credential?.user?.email
    })
  )

  return (
    (signinProvider === ProviderID.google ||
      signinProvider === ProviderID.github) && (
      <Form.Item>
        <Alert
          message={<>Signed in as {email}</>}
          type='info'
          showIcon
          closeText='Sign Out'
          onClose={() => history.push('/signout')}
          icon={
            signinProvider === ProviderID.google ? (
              <AntIcon
                component={() => (
                  <Icon title='Google' path={mdiGoogle} size={0.6} />
                )}
              />
            ) : signinProvider === ProviderID.github ? (
              <AntIcon
                component={() => (
                  <Icon title='Github' path={mdiGithub} size={0.6} />
                )}
              />
            ) : (
              <MailOutlined />
            )
          }
        />
      </Form.Item>
    )
  )
}
