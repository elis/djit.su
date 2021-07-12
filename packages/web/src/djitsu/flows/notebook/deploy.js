import React, { useEffect, useRef, useState } from 'react'

import {
  Divider,
  notification,
  Steps,
  Form,
  Popover,
  Input,
  Row,
  Col
} from 'antd'
import { useNotebook } from 'djitsu/providers/notebook'
import Modal from 'antd/lib/modal/Modal'
import { GlobalOutlined, InfoCircleOutlined } from '@ant-design/icons'
import AntIconMDI from 'djitsu/components/anticon-mdi'
import { mdiPackageUp } from '@mdi/js'
import useStates from 'djitsu/utils/hooks/use-states'

const { Step } = Steps

export const useDeployFlow = () => {
  const [state, actions] = useNotebook()
  const [notifications, notificationContext] = notification.useNotification()
  // const [modal, modalContext] = Modal.useModal()
  const [showDeploy, setShowDeploy] = useState(false)
  const [deploying, setDeploying] = useState()
  const [allowProceed] = useState(true)

  const [toDeploy, setToDeploy, resetToDeploy] = useStates({})

  const stateRef = useRef()
  const getFreshState = () => stateRef.current
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const { isDeployed, isPublished } = state.currentNotebook.notebook?.meta || {}

  const deploy = () => {
    const state = getFreshState()
    if (state.currentNotebook.unsavedNotebook) {
      notifications.error({ message: 'Save before deploying' })
    } else if (!isPublished) {
      notifications.error({ message: 'Publish notebook before deploying' })
    } else if (
      isPublished &&
      isDeployed &&
      state.currentNotebook.notebook.meta.version ===
        state.currentNotebook.notebook.properties.deployedVersion
    ) {
      notifications.error({
        message:
          'Notebook already deployed - publish a new version to update your deployment'
      })
    } else {
      const title = state.currentNotebook.notebook.properties.title

      console.log('GOING TO SUGGEST TITLE?', { isPublished, title })
      if (!isDeployed) {
        const safe = `${title}`
          .toLowerCase()
          .replace(/[^a-z0-9-_]+/g, '-')
          .replace(/-$/, '')
          .replace(/-+/g, '-')
        setStep('hostname', safe)
      } else {
        setStep('hostname', state.currentNotebook.notebook.properties.hostname)
      }

      setShowDeploy(true)
    }
  }

  const beginDeploy = async () => {
    notifications.info({ message: 'Deployment started' })
    setDeploying(true)

    const notebookId = state.currentNotebook.notebookId
    const { hostname } = steps

    const deployResult = await actions.deployNotebook(
      notebookId,
      hostname + '.djit.me'
    )
    await actions.loadNotebook(notebookId)
    notifications.success({ message: <>Deplyed v{deployResult}</> })
    setShowDeploy(false)
  }

  const [steps, setStep, resetSteps] = useStates({
    step: 1
  })

  const doStep = async () => {
    if (steps.step === 0) {
      setStep('step', 1)
      setStep('progress', 30)
    } else if (steps.step === 1) {
      form.submit()
    } else if (steps.step === 2) {
      beginDeploy()
    }
  }
  const [form] = Form.useForm()

  const onHostnameComplete = (values) => {
    setToDeploy('hostnaem', values.hostname)
    setStep('step', 2)
  }
  const hostnameOnChange = (e) => {
    const {
      target: { value }
    } = e
    const safe = `${value}`
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/-$/, '')
      .replace(/-+/g, '-')

    setStep('hostname', safe)
  }

  useEffect(() => {
    if (steps.step === 2) form.validateFields()
  }, [steps.step])

  useEffect(() => {
    if (showDeploy && toDeploy.hostname) {
      resetSteps()
      resetToDeploy()
      setDeploying()
    }
  }, [showDeploy])

  // const onNextVersionChange = (nextValue) => {
  //   if (nextValue === 'custom' && !steps.showCustomVersion)
  //     setStep('showCustomVersion', true)
  //   else if (nextValue !== 'custom' && steps.showCustomVersion)
  //     setStep('showCustomVersion', false)
  // }

  const majorGutter = [8, 12]
  const minorGutter = [8, 8]

  const modalContext = (
    <>
      <Modal
        visible={showDeploy}
        okText={deploying ? <>deploying...</> : <>Continue</>}
        cancelText={
          steps.step === 1 ? (
            <>Cancel</>
          ) : steps.step > 1 ? (
            <>Back</>
          ) : (
            <>Cancel</>
          )
        }
        title={
          <>
            <GlobalOutlined />{' '}
            <span>
              Deploy{deploying ? 'ing' : 'ed'} Notebook{deploying ? '...' : ''}
            </span>
          </>
        }
        confirmLoading={deploying}
        onOk={() => {
          doStep()
        }}
        onCancel={() => {
          if (steps.step > 1) {
            setStep('step', steps.step - 1)
          } else {
            notifications.warning({ message: 'Deployment cancelled' })
            setShowDeploy(false)
          }
        }}
        okButtonProps={{
          disabled: !allowProceed
        }}
      >
        <>
          <Row gutter={majorGutter}>
            <Col flex='auto'>
              <DeploySteps steps={steps} />
            </Col>
          </Row>
          <Divider />
          <div style={{ float: 'right' }}>
            <AntIconMDI
              path={mdiPackageUp}
              style={{ fontSize: 96, opacity: 0.25 }}
            />
          </div>
          <Row gutter={majorGutter}>
            <Col flex='auto'>
              {!isDeployed && steps.step === 0 && (
                <>
                  <p>
                    Deploying a note will allow user to access your app from a
                    custom hostname
                  </p>
                </>
              )}
              {isPublished && steps.step === 0 && (
                <>
                  <p>Deploying a new version</p>
                </>
              )}
              {steps.step === 1 && (
                <Form
                  form={form}
                  onFinish={onHostnameComplete}
                  initialValues={{
                    hostname: steps.hostname
                  }}
                  labelCol={{ span: 8 }}
                >
                  <p>Enter hostname</p>
                  <Form.Item
                    label={
                      <>
                        <Popover
                          title={<>Hostname</>}
                          content={
                            <>
                              <p style={{ maxWidth: 180 }}>x</p>
                            </>
                          }
                          placement='bottomLeft'
                        >
                          Hostname <InfoCircleOutlined />
                        </Popover>
                      </>
                    }
                    name='hostname'
                    rules={[
                      {
                        validator: async (rule, value) => {
                          const safe = `${value}`
                            .toLowerCase()
                            .replace(/[^a-z0-9-_]+/g, '-')
                            .replace(/-$/, '')
                            .replace(/-+/g, '-')

                          if (safe !== value)
                            throw new Error('Illegal characters')
                        }
                      },
                      {
                        validator: async (rule, value) => {
                          // console.log('VALIDATING', value, { rule, value })
                          let found = false
                          try {
                            await actions.getNotebookByHostname(
                              value + '.djit.me'
                            )
                            found = true
                          } catch (error) {
                            // no-op
                          }
                          if (found) throw new Error('Hostname unavailable')
                        }
                      }
                    ]}
                    extra={<small>{steps.hostname}.djit.me</small>}
                  >
                    <Input onChange={hostnameOnChange} />
                  </Form.Item>
                  {/* {steps.showCustomVersion && (
                    <Form.Item
                      label={<>Version</>}
                      name='customVersion'
                      rules={[
                        {
                          validator: async (rule, value) => {
                            const isValid = semverValid(value)
                            if (!isValid) throw new Error('Nah, not valid')
                            const isGt = semverGt(value, version)
                            if (!isGt)
                              throw new Error(
                                'Needs to be higher version than ' + version
                              )
                          }
                        }
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  )} */}
                </Form>
              )}
              {steps.step === 2 && (
                <>
                  Continue to deploy current app to{' '}
                  <code>{steps.hostname}.djit.me</code>
                </>
              )}
              {/* {isPublished && steps.step === 1 && (
                <Form
                  form={form}
                  onFinish={onVersionComplete}
                  initialValues={{
                    nextVersion: 'patch',
                    customVersion: version
                  }}
                  labelCol={{ span: 8 }}
                >
                  <p>Currently released version: {version}</p>
                  <Form.Item
                    label={
                      <>
                        <Popover
                          title={<>Version</>}
                          content={
                            <>
                              <p style={{ maxWidth: 180 }}>
                                If you need to decide what version to use, pick{' '}
                                <code>Minor</code> if your notebook is still in
                                it&apos;s early development phase, and{' '}
                                <code>Major</code> if it&apos;s a finished
                                product initial release.
                              </p>
                            </>
                          }
                          placement='bottomLeft'
                        >
                          Next Version <InfoCircleOutlined />
                        </Popover>
                      </>
                    }
                    name='nextVersion'
                  >
                    <Select onChange={onNextVersionChange}>
                      <Select.Option value='patch'>
                        {semverInc(version, 'patch')} — Patch
                      </Select.Option>
                      <Select.Option value='minor'>
                        {semverInc(version, 'minor')} — Minor
                      </Select.Option>
                      <Select.Option value='major'>
                        {semverInc(version, 'major')} — Major
                      </Select.Option>
                      <Select.Option value='custom'>Custom</Select.Option>
                    </Select>
                  </Form.Item>
                  {steps.showCustomVersion && (
                    <Form.Item
                      label={<>Version</>}
                      name='customVersion'
                      rules={[
                        {
                          validator: async (rule, value) => {
                            const isValid = semverValid(value)
                            if (!isValid) throw new Error('Nah, not valid')
                            const isGt = semverGt(value, version)
                            if (!isGt)
                              throw new Error(
                                'Needs to be higher version than ' + version
                              )
                          }
                        }
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  )}
                </Form>
              )} */}

              {/* {!isPublished && steps.step === 2 && (
                <Form
                  form={form}
                  onFinish={onNameComplete}
                  initialValues={{ title: steps.title, name: steps.name }}
                  labelCol={{ span: 8 }}
                >
                  <Form.Item
                    label='Title'
                    name='title'
                    rules={[
                      { required: true, message: 'Title is required' },
                      {
                        min: 3,
                        message: 'At least 3 characters length is required'
                      },
                      { whitespace: true, message: 'Cannot be empty' }
                    ]}
                  >
                    <Input onChange={onTitleChange} />
                  </Form.Item>
                  <Form.Item
                    label='Package Name'
                    name='name'
                    dependencies={['title']}
                    rules={[
                      { required: true, message: 'Name is required' },
                      {
                        min: 3,
                        message: 'At least 3 characters length is required'
                      },
                      {
                        max: 128,
                        message: 'Maximum of 128 characters'
                      },
                      { whitespace: true, message: 'Cannot be empty' },
                      {
                        pattern: /^[a-z][a-z0-9-_]{2,}$/,
                        message: 'Unacceptable characters'
                      },
                      {
                        validator: async (_rule, value) => {
                          setStep('resolving-for-' + value, true)
                          let result
                          try {
                            result = await actions.getNotebookByName(
                              value,
                              user.currentUsername
                            )
                            setStep('invalid-for-' + value, true)
                          } catch (error) {
                            setStep('valid-for-' + value, true)
                          }
                          setStep('resolving-for-' + value, false)
                          if (result) return Promise.reject('Already used')
                          return Promise.resolve()
                        },
                        message: 'Name unavailable'
                      }
                    ]}
                    extra={
                      <small>
                        djit.su/@{user.currentUsername}/{steps.name}
                      </small>
                    }
                  >
                    <Input
                      suffix={
                        steps['resolving-for-' + steps.name] ? (
                          <LoadingOutlined />
                        ) : steps['invalid-for-' + steps.name] ? (
                          <CloseCircleFilled
                            style={{ color: 'var(--error-color)' }}
                          />
                        ) : steps['valid-for-' + steps.name] ? (
                          <CheckCircleFilled
                            style={{ color: 'var(--success-color)' }}
                          />
                        ) : (
                          <></>
                        )
                      }
                    />
                  </Form.Item>
                </Form>
              )} */}
              {/* {isPublished && steps.step === 2 && (
                <Form
                  form={form}
                  onFinish={onNameComplete}
                  initialValues={{ title: steps.title }}
                  labelCol={{ span: 8 }}
                >
                  <Form.Item label='Update Title' name='updateTitle'>
                    <Switch
                      onChange={(isUpdate) => {
                        console.log('name changed:', isUpdate)
                        if (isUpdate && steps.suggestedTitle) {
                          form.setFields([
                            {
                              name: 'title',
                              touched: false,
                              value: steps.suggestedTitle
                            }
                          ])
                          setStep('suggestedTitle', false)
                        } else if (!isUpdate) {
                          form.setFields([
                            {
                              name: 'title',
                              touched: false,
                              value: steps.originalTitle
                            }
                          ])
                          setStep('suggestedTitle', steps.proposedTitle)
                        }
                        setStep('updateTitle', isUpdate)
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    label='Title'
                    name='title'
                    disabled={!steps.updateTitle}
                    rules={[
                      { required: true, message: 'Title is required' },
                      {
                        min: 3,
                        message: 'At least 3 characters length is required'
                      },
                      { whitespace: true, message: 'Cannot be empty' }
                    ]}
                  >
                    <Input onChange={onTitleChange} />
                  </Form.Item>
                </Form>
              )} */}
              {!isPublished && steps.step === 3 && (
                <>
                  <Row gutter={minorGutter}>
                    <Col>
                      <h3>Deploy Summary</h3>
                    </Col>
                  </Row>
                  {/* <Row gutter={minorGutter}>
                    <Col span='12'>
                      <Statistic
                        title='Release Type'
                        value={RELEASE_TYPES[steps.releaseType]}
                      />
                    </Col>
                    <Col span='12'>
                      <Statistic
                        title='Publish Version'
                        value={toPublish.version}
                      />
                    </Col>
                  </Row>
                  <Row gutter={minorGutter}>
                    <Col span='12'>
                      <Statistic title='Title' value={toPublish.title} />
                    </Col>
                    <Col span='12'>
                      <Statistic
                        title='Name'
                        value={toPublish.name}
                        formatter={(value) => (
                          <>
                            @{user.currentUsername}/{value}
                          </>
                        )}
                      />
                    </Col>
                  </Row> */}
                </>
              )}
              {isPublished && steps.step === 3 && (
                <>
                  <Row gutter={minorGutter}>
                    <Col>
                      <h2>Deploy Summary</h2>
                    </Col>
                  </Row>
                  {/* <Row gutter={minorGutter}>
                    <Col span='12'>
                      <Statistic
                        title='Release Type'
                        value={RELEASE_TYPES[steps.releaseType]}
                      />
                    </Col>
                    <Col span='12'>
                      <Statistic
                        title='Version'
                        value={toPublish.version}
                        formatter={(value) => (
                          <>
                            {state.currentNotebook.notebook.meta.version}{' '}
                            <ArrowRightOutlined
                              style={{ fontSize: '0.5em', opacity: 0.8 }}
                            />{' '}
                            {value}
                          </>
                        )}
                      />
                    </Col>
                  </Row>
                  <Row gutter={minorGutter}>
                    <Col span='12'>
                      {!steps.updateTitle ||
                      state.currentNotebook.notebook.title ===
                        toPublish.title ? (
                        <></>
                      ) : (
                        <Statistic title='Title' value={toPublish.title} />
                      )}
                    </Col>
                  </Row> */}
                </>
              )}
            </Col>
          </Row>
          <div style={{ clear: 'both' }} />
        </>
      </Modal>
    </>
  )

  return [
    {},
    { deploy },
    <>
      {notificationContext}
      {modalContext}
    </>
  ]
}

const DeploySteps = (props) => {
  const { steps } = props
  return (
    <Steps size='small' current={steps.step}>
      <Step
        status={
          steps.step === 0 ? 'process' : steps.step > 0 ? 'finish' : 'wait'
        }
        title='Prepare'
      />
      <Step
        status={
          steps.step === 1 ? 'process' : steps.step > 1 ? 'finish' : 'wait'
        }
        title='Hostname'
      />
      <Step
        status={
          steps.step === 2 ? 'process' : steps.step > 2 ? 'finish' : 'wait'
        }
        title='Deploy'
      />
      <Step
        status={
          steps.step === 3 ? 'process' : steps.step > 3 ? 'finish' : 'wait'
        }
        title='Done'
      />
    </Steps>
  )
}

// const RELEASE_TYPES = {
//   prerelease: 'Prerelease',
//   premajor: 'Premajor',
//   patch: 'Patch',
//   prepatch: 'Prepatch',
//   minor: 'Minor',
//   preminor: 'Preminor',
//   major: 'Major'
// }
