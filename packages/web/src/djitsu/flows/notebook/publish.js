import React, { useEffect, useRef, useState } from 'react'

import {
  Divider,
  message,
  Select,
  Steps,
  Form,
  Popover,
  Input,
  Switch,
  Statistic,
  Row,
  Col
} from 'antd'
import { useNotebook } from 'djitsu/providers/notebook'
import Modal from 'antd/lib/modal/Modal'
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  GlobalOutlined,
  InfoCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import AntIconMDI from 'djitsu/components/anticon-mdi'
import { mdiPackageUp } from '@mdi/js'
import useStates from 'djitsu/utils/hooks/use-states'
import { useUser } from 'djitsu/providers/user'
import semverInc from 'semver/functions/inc'
import semverValid from 'semver/functions/valid'
import semverGt from 'semver/functions/gt'
import semverDiff from 'semver/functions/diff'

const { Step } = Steps

export const usePublishFlow = () => {
  const [state, actions] = useNotebook()
  // const [modal, modalContext] = Modal.useModal()
  const [showPublish, setShowPublish] = useState()
  const [publishing, setPublishing] = useState()
  const [allowProceed] = useState(true)

  const [user] = useUser()

  const [toPublish, setToPublish, resetToPublish] = useStates({})

  const stateRef = useRef()
  const getFreshState = () => stateRef.current
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const { isPublished, version = '0.0.0' } =
    state.currentNotebook.notebook?.meta || {}

  const publish = () => {
    const state = getFreshState()
    if (state.currentNotebook.unsavedNotebook) {
      message.warning('Save your document before publishlishing', 1.5)
    } else if (
      isPublished &&
      state.currentNotebook.notebook.meta.published ===
        state.currentNotebook.notebook.meta.updated
    ) {
      message.warning('Most recent revisions already published')
    } else {
      const title = (
        state.currentNotebook.notebook.blocks.find(
          ({ type, data: { level } }) => type === 'header' && level === 1
        ) ||
        state.currentNotebook.notebook.blocks.find(
          ({ type }) => type === 'header'
        )
      )?.data?.text?.replace(/(<([^>]+)>)/gi, '')

      console.log('GOING TO SUGGEST TITLE?', { isPublished, title })
      if (!isPublished) {
        setStep('title', title)
        const safe = `${title}`
          .toLowerCase()
          .replace(/[^a-z0-9-_]+/g, '-')
          .replace(/-$/, '')
          .replace(/-+/, '-')
        setStep('name', safe)
        setStep('hostname', safe)
      } else {
        setStep('title', state.currentNotebook.notebook.properties.title)
        setStep(
          'originalTitle',
          state.currentNotebook.notebook.properties.title
        )
        setStep('suggestedTitle', title)
        setStep('proposedTitle', title)
      }

      setShowPublish(true)
    }
  }

  const beginPublish = async () => {
    message.info('Publishing has begun')
    setPublishing(true)

    const notebookId = state.currentNotebook.notebookId
    const { title, name, version } = toPublish

    const publishResult = await actions.publishNotebook(
      notebookId,
      version,
      title,
      name
    )
    await actions.loadNotebook(notebookId)
    message.success(`Published v${publishResult}`)
    setShowPublish(false)
  }

  const [steps, setStep, resetSteps] = useStates({
    step: 0
  })

  const doStep = async () => {
    if (steps.step === 0) {
      setStep('step', 1)
      setStep('progress', 30)
    } else if (steps.step === 1 || steps.step === 2) {
      form.submit()
    } else if (steps.step === 3) {
      beginPublish()
    }
  }
  const [form] = Form.useForm()

  const onVersionComplete = (values) => {
    const { initialVersion, nextVersion, customVersion } = values
    if (!isPublished) {
      setToPublish(
        'version',
        initialVersion === 'patch'
          ? '0.0.1'
          : initialVersion === 'minor'
          ? '0.1.0'
          : initialVersion === 'major'
          ? '1.0.0'
          : customVersion
      )
      setStep(
        'releaseType',
        initialVersion === 'custom'
          ? semverDiff(version, customVersion)
          : initialVersion
      )
    } else {
      setToPublish(
        'version',
        nextVersion === 'custom'
          ? customVersion
          : semverInc(version, nextVersion)
      )
      setStep(
        'releaseType',
        nextVersion === 'custom'
          ? semverDiff(
              state.currentNotebook.notebook.meta.version,
              customVersion
            )
          : nextVersion
      )
    }
    setStep('step', 2)
  }

  const onNameComplete = (values) => {
    setToPublish('title', values.title)
    setToPublish('name', values.name)
    setStep('step', 3)
  }
  const onTitleChange = (e) => {
    const {
      target: { value }
    } = e
    const safe = `${value}`
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/-$/, '')

    if (!form.isFieldTouched('name')) {
      setStep('name', safe)
      form.setFields([
        {
          name: 'name',
          touched: false,
          value: safe
        }
      ])
      form.validateFields(['name'])
    }
  }
  useEffect(() => {
    if (steps.step === 2) form.validateFields()
  }, [steps.step])
  useEffect(() => {
    if (showPublish && toPublish.version) {
      resetSteps()
      resetToPublish()
      setPublishing()
    }
  }, [showPublish])

  const onNextVersionChange = (nextValue) => {
    if (nextValue === 'custom' && !steps.showCustomVersion)
      setStep('showCustomVersion', true)
    else if (nextValue !== 'custom' && steps.showCustomVersion)
      setStep('showCustomVersion', false)
  }

  const majorGutter = [8, 12]
  const minorGutter = [8, 8]

  const modalContext = (
    <>
      <Modal
        visible={showPublish}
        okText={publishing ? <>Publishing...</> : <>Continue</>}
        cancelText={
          steps.step === 1 ? <>Cancel</> : steps.step > 1 ? <>Back</> : <>:D</>
        }
        title={
          <>
            <GlobalOutlined />{' '}
            <span>
              Publish{publishing ? 'ing' : ''} Notebook{publishing ? '...' : ''}
            </span>
          </>
        }
        confirmLoading={publishing}
        onOk={() => {
          doStep()
        }}
        onCancel={() => {
          if (steps.step > 1) {
            setStep('step', steps.step - 1)
          } else {
            message.info('Publishing cancelled')
            setShowPublish(false)
          }
        }}
        okButtonProps={{
          disabled: !allowProceed
        }}
      >
        <>
          <Row gutter={majorGutter}>
            <Col flex='auto'>
              <PublishSteps steps={steps} />
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
              {!isPublished && steps.step === 0 && (
                <>
                  <p>
                    Publishing a document will make it publicly accessible by a
                    unique name.
                  </p>
                  <p>
                    Unlike
                    <>
                      {' '}
                      <code>Link Sharing</code>{' '}
                    </>
                    publishing a document is not reversible and a published
                    document and all of it&apos;s published versions will be
                    permenantly accessible to the general public.
                  </p>
                </>
              )}
              {isPublished && steps.step === 0 && (
                <>
                  <p>
                    Publishing a new version of your document will allow users
                    to access the new version and all the previously released
                    versions.
                  </p>
                </>
              )}
              {!isPublished && steps.step === 1 && (
                <Form
                  form={form}
                  onFinish={onVersionComplete}
                  initialValues={{
                    initialVersion: 'minor',
                    customVersion: '0.0.1'
                  }}
                  labelCol={{ span: 8 }}
                >
                  <p>
                    Select what version your notebook will be packaged initially
                    as — djitsu uses the{' '}
                    <a
                      href='https://semver.org/'
                      target='_blank'
                      rel='noreferrer'
                    >
                      Semantic Versioning
                    </a>{' '}
                    to denote versions of published packages.
                  </p>
                  <Form.Item
                    label={
                      <>
                        <Popover
                          title={<>Initial Version</>}
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
                          Initial Version <InfoCircleOutlined />
                        </Popover>
                      </>
                    }
                    name='initialVersion'
                  >
                    <Select onChange={onNextVersionChange}>
                      <Select.Option value='patch'>0.0.1 — Patch</Select.Option>
                      <Select.Option value='minor'>0.1.0 — Minor</Select.Option>
                      <Select.Option value='major'>1.0.0 — Major</Select.Option>
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
              )}
              {isPublished && steps.step === 1 && (
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
              )}

              {!isPublished && steps.step === 2 && (
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
                      onChange={(e) => {
                        setStep('name', e.target.value)
                      }}
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
              )}
              {isPublished && steps.step === 2 && (
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
              )}
              {!isPublished && steps.step === 3 && (
                <>
                  <Row gutter={minorGutter}>
                    <Col>
                      <h3>Publish Summary</h3>
                    </Col>
                  </Row>
                  <Row gutter={minorGutter}>
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
                  </Row>
                </>
              )}
              {isPublished && steps.step === 3 && (
                <>
                  <Row gutter={minorGutter}>
                    <Col>
                      <h2>Release Summary</h2>
                    </Col>
                  </Row>
                  <Row gutter={minorGutter}>
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
                  </Row>
                </>
              )}
            </Col>
          </Row>
          <div style={{ clear: 'both' }} />
        </>
      </Modal>
    </>
  )

  return [{}, { publish }, <>{modalContext}</>]
}

const PublishSteps = (props) => {
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
        title='Version'
      />
      <Step
        status={
          steps.step === 2 ? 'process' : steps.step > 2 ? 'finish' : 'wait'
        }
        title='Name'
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

const RELEASE_TYPES = {
  prerelease: 'Prerelease',
  premajor: 'Premajor',
  patch: 'Patch',
  prepatch: 'Prepatch',
  minor: 'Minor',
  preminor: 'Preminor',
  major: 'Major'
}
