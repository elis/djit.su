/* eslint-disable react/prop-types */
import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react'
import {
  Divider,
  message,
  Row,
  Col,
  PageHeader,
  Space,
  Button,
  Avatar,
  Menu,
  Dropdown,
  notification,
  Tooltip,
  Checkbox
} from 'antd'
const CheckboxGroup = Checkbox.Group
import copy from 'copy-to-clipboard'
import styled from 'styled-components'
import Helmet from 'react-helmet'
import {
  GlobalOutlined,
  StarOutlined,
  HeartOutlined,
  UserOutlined,
  EyeOutlined,
  MoreOutlined,
  LinkOutlined,
  CaretRightOutlined,
  FileSyncOutlined,
  FileAddOutlined,
  TeamOutlined,
  CaretRightFilled,
  PlaySquareOutlined,
  LoadingOutlined,
  ForkOutlined,
  CheckOutlined,
  UndoOutlined,
  HeartFilled,
  StarFilled,
  RocketOutlined,
  ExportOutlined
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { useNotebook } from 'djitsu/providers/notebook'
import { useHistory } from 'djitsu/adapters/routes'
import useStates from 'djitsu/utils/hooks/use-states'
import { usePublishFlow } from 'djitsu/flows/notebook/publish'
import { useDeployFlow } from 'djitsu/flows/notebook/deploy'
import { useUser } from 'djitsu/providers/user'
import Modal from 'antd/lib/modal/Modal'
import NotebookTags from 'djitsu/components/notebooks/notebook-tags'

export const NotebookHeader = (props) => {
  const { notebook, userProfile, notebookId, publicView } = props
  const appRef = useRef()
  const [api, contextHolder] = notification.useNotification()
  const history = useHistory()
  const [loading, setLoading] = useStates()
  const [user] = useUser()

  const [state, actions] = useNotebook()
  const [documentMenuVisible, setDocumentMenuVisible] = useState()

  let exports = []
  if (notebook.compiled) exports = notebook?.compiled.exports

  const { isPublic, isPublished, createdBy } = notebook?.meta || {}
  const { name: notebookName } = notebook?.properties || {}
  const isOwner = useMemo(() => createdBy === user.currentUsername, [createdBy])
  const hasUnsaved = !!state.currentNotebook.unsavedNotebook

  const [, publishActions, publishContext] = usePublishFlow()
  const [, deployActions, deployContext] = useDeployFlow()

  const publishedLocation = isPublished ? `@${createdBy}/${notebookName}` : null

  const notebookRef = useRef()
  // const getFreshNotebook = useCallback(() => notebookRef.current, [
  //   notebookRef.current
  // ])
  useEffect(() => {
    notebookRef.current = notebook
  }, [notebook])

  const [showCopy, setShowCopy] = useState(false)

  const CopyModal = () => {
    const majorGutter = [8, 12]
    const [indeterminate, setIndeterminate] = React.useState(false)
    const [checkAll, setCheckAll] = React.useState(true)
    const defaultCheckedList = [...exports]
    const [checkedList, setCheckedList] = React.useState(defaultCheckedList)
    const plainOptions = [...exports]

    const createExportString = () => {
      let exportsAsString = ''
      checkedList.forEach((item, i) => {
        i === exports.length - 1
          ? (exportsAsString += item)
          : (exportsAsString += `${item}, `)
      })
      return `import { ${exportsAsString} } from '${publishedLocation}'`
    }

    const onChange = (list) => {
      console.log(list)
      setCheckedList(list)
      setIndeterminate(!!list.length && list.length < plainOptions.length)
      setCheckAll(list.length === plainOptions.length)
    }

    const onCheckAllChange = (e) => {
      setCheckedList(e.target.checked ? plainOptions : [])
      setIndeterminate(false)
      setCheckAll(e.target.checked)
    }
    return (
      <>
        <Modal
          visible={showCopy}
          okText={'Copy Code'}
          cancelText={'Cancel'}
          title={
            <>
              <GlobalOutlined /> <span>Copy Exports Code</span>
            </>
          }
          onOk={() => {
            copy(createExportString())
            message.success('Import address copied to clipboard')
            setShowCopy(false)
          }}
          onCancel={() => {
            setShowCopy(false)
          }}
        >
          <StyledCopyModal>
            <Row gutter={majorGutter}>
              <Col flex='auto'>
                <h1>Select Exports To Copy</h1>
                <div className='checkboxes'>
                  <Checkbox
                    indeterminate={indeterminate}
                    onChange={onCheckAllChange}
                    checked={checkAll}
                  >
                    {checkAll ? 'Deselect All' : 'Select All'}
                  </Checkbox>
                  <Divider />
                  <CheckboxGroup
                    options={plainOptions}
                    value={checkedList}
                    onChange={onChange}
                  />
                </div>
              </Col>
            </Row>
            <Divider />
            <Row gutter={majorGutter}>
              <Col flex='auto'>
                <h3>Import Code:</h3>
                <code>{createExportString()}</code>
              </Col>
            </Row>
            <div style={{ clear: 'both' }} />
          </StyledCopyModal>
        </Modal>
      </>
    )
  }

  const handleLikeClick = async () => {
    setLoading('like', true)
    await actions.likeCurrent(!notebook.meta.isLiked)
    await actions.loadNotebook(notebookId)
    await actions.getNotebookMeta(user.currentUsername, notebookId)
    setLoading('like', false)
  }
  const handleStarClick = async () => {
    setLoading('star', true)
    await actions.starCurrent(!notebook.meta.isStarred)
    await actions.loadNotebook(notebookId)
    await actions.getNotebookMeta(user.currentUsername, notebookId)
    setLoading('star', false)
  }
  const handleForkClick = async () => {
    setLoading('fork', true)
    const forkId = await actions.saveFork(!!publicView)
    await actions.forkCurrent()
    api.success({
      message: <>Notebook Forked Successfully</>,
      icon: <ForkOutlined />
    })
    setLoading('fork', false)
    setLoading('forkReady', true)
    history.push(`/d${forkId}`, { fork: true })
  }
  useEffect(() => {
    if (loading.forkReady) {
      const tid = setTimeout(() => {
        setLoading('forkReady', false)
      }, 5000)
      return () => {
        clearTimeout(tid)
      }
    }
  }, [loading.forkReady])

  const handleMenuClick = useCallback(
    async ({ key, exported }) => {
      console.log('handle menu click', key, exported, publicView)
      if (key === 'run') {
        const appView = window.open(
          publicView
            ? `/@${notebook.meta.createdBy}/${notebook.properties.name}:${
                notebook.meta.version
              }/${exported || 'Main'}`
            : `/d${notebookId}/${exported || 'Main'}`,
          'app-view'
        )
        appRef.current = appView
      } else if (key === 'reset') {
        const done = actions.resetCurrent()
        actions.resetCurrent()
        setTimeout(() => done(), 4)
      } else if (key === 'fork') {
        handleForkClick()
      } else if (key.match(/^run-exported/)) {
        const [, exported] = key.match(/^run-exported-(.*)$/)

        const appView = window.open(
          publicView
            ? `/@${notebook.meta.createdBy}/${notebook.properties.name}:${
                notebook.meta.version
              }/${exported || 'Main'}`
            : `/d${notebookId}/${exported || 'Main'}`,
          'app-view'
        )

        appRef.current = appView
        setDocumentMenuVisible(false)
      } else if (key === 'share' || key === 'unshare') {
        try {
          await actions.enableLinkSharing(notebookId, !isPublic)
          if (isPublic)
            message.info(
              'Your document is now private and cannot be accessed anonymously'
            )
          else
            message.info(
              'Your document can now be accessed by anyone with a link'
            )
        } catch (error) {
          console.log('Error of action:', error)
          message.error(
            <>
              <h4>Error Sharing</h4>
              <p>{error.toString()}</p>
            </>
          )
        }
      } else if (key === 'publish') {
        setDocumentMenuVisible(false)
        const result = await publishActions.publish()
        // await actions.enableLinkSharing(notebookId, !isPublic)
        console.log('Result of publish:', result)
      } else if (key === 'deploy') {
        setDocumentMenuVisible(false)
        const result = await deployActions.deploy()
        // await actions.enableLinkSharing(notebookId, !isPublic)
        console.log('Result of deploy:', result)
      }
    },
    [isPublic, isPublished, notebookId, publicView]
  )

  const hasMain =
    notebook?.compiled?.exports &&
    !!notebook.compiled.exports.length &&
    notebook.compiled.exports.indexOf('Main') !== -1

  const documentMenu = useMemo(
    () => (
      <Menu onClick={handleMenuClick}>
        {hasMain && notebook.compiled.exports.length === 1 && (
          <Menu.Item key='run' icon={<CaretRightFilled />}>
            App View
          </Menu.Item>
        )}
        {hasMain && notebook.compiled.exports.length > 1 && (
          <Menu.SubMenu
            title={<>App View</>}
            icon={<CaretRightFilled />}
            onTitleClick={() => {
              const appView = window.open(
                publicView
                  ? `/@${createdBy}/${notebookName}/Main`
                  : `/d${notebookId}/Main`,
                'app-view'
              )
              appRef.current = appView
            }}
          >
            {notebook.compiled.exports
              .filter((e) => e !== 'Main')
              .map((e) => (
                <Menu.Item
                  key={`run-exported-${e}`}
                  icon={<CaretRightOutlined />}
                >
                  {e}
                </Menu.Item>
              ))}
          </Menu.SubMenu>
        )}
        {!hasMain && notebook?.compiled?.exports?.length >= 1 && (
          <Menu.SubMenu title={<>App View</>} icon={<PlaySquareOutlined />}>
            {notebook.compiled.exports
              .filter((e) => e !== 'Main')
              .map((e) => (
                <Menu.Item
                  key={`run-exported-${e}`}
                  icon={<CaretRightOutlined />}
                >
                  {e}
                </Menu.Item>
              ))}
          </Menu.SubMenu>
        )}

        {hasMain && isOwner && <Menu.Divider />}
        {isOwner && !isPublic && (
          <Menu.Item
            key='share'
            icon={
              notebook.status.sharing ? <LoadingOutlined /> : <LinkOutlined />
            }
          >
            Enable Link Sharing
          </Menu.Item>
        )}
        {isOwner && isPublic && !isPublished && (
          <Menu.Item key='unshare' icon={<EyeOutlined />}>
            Disable Link Sharing
          </Menu.Item>
        )}
        {isOwner && !isPublished && (
          <Menu.Item key='publish' icon={<GlobalOutlined />}>
            Publish Document
          </Menu.Item>
        )}
        {isOwner && isPublished && (
          <Menu.Item key='publish' icon={<GlobalOutlined />}>
            Publish New Version
          </Menu.Item>
        )}
        {isOwner && (
          <Menu.Item key='deploy' icon={<RocketOutlined />}>
            Deploy
          </Menu.Item>
        )}

        {publicView && <Menu.Divider />}
        {publicView && (
          <Menu.Item key='fork' icon={<ForkOutlined />} disabled={!hasUnsaved}>
            Save Fork
          </Menu.Item>
        )}
        {publicView && (
          <Menu.Item key='reset' icon={<UndoOutlined />} disabled={!hasUnsaved}>
            Reset Changes
          </Menu.Item>
        )}
      </Menu>
    ),
    [isPublic, isPublished, hasMain, isOwner, notebook, hasMain, hasUnsaved]
  )

  // useEffect(() => {
  //   console.log(
  //     'notebook, userProfile, notebookId, isOwner UPDATED FOR HEADER:',
  //     { notebook, userProfile, notebookId, isOwner }
  //   )
  // }, [notebook, userProfile, notebookId, isOwner])
  // console.log(
  //   '📒 notebook, userProfile, notebookId, isOwner UPDATED FOR HEADER:',
  //   { hasMain, notebook, userProfile, notebookId, isOwner }
  // )

  const handleSelfClick = useCallback(
    (event) => {
      if (event.metaKey) console.log('📕 Notebook:', notebook)
    },
    [notebook]
  )
  return (
    <>
      <CopyModal />
      <Row onClick={handleSelfClick}>
        <Col flex='auto' />
        <Col flex='650px'>
          <StyledPageHeader>
            <Helmet>
              <title>{notebook?.properties?.title || notebookId}</title>
            </Helmet>
            {contextHolder}
            {publishContext}
            {deployContext}
            <Avatar
              size={36}
              src={userProfile?.photoUrl}
              icon={
                !userProfile?.photoUrl && (
                  <UserOutlined
                    style={{
                      fontSize: '1em',
                      color: 'var(--tool-background-color)'
                    }}
                  />
                )
              }
            />
            <main>
              <Space direction='vertical' size='small'>
                <Space direction='vertical' size='small'>
                  {userProfile?.displayName && (
                    <>
                      <strong>
                        <Link
                          className='profile-name'
                          to={`/@${createdBy || user.currentUsername}`}
                        >
                          {userProfile.displayName}
                        </Link>
                      </strong>
                      <span>—</span>
                    </>
                  )}
                  <Link
                    className='profile-username'
                    to={`/@${createdBy || user.currentUsername}`}
                  >
                    @{createdBy || user.currentUsername}
                  </Link>
                </Space>
                {isPublished && exports.length > 0 ? (
                  <Tooltip
                    placement='bottom'
                    title={`Copy Import Location`}
                    onClick={() => {
                      setShowCopy(true)
                    }}
                  >
                    <span className='click-to-copy-import-location'>
                      {exports.length} exports <ExportOutlined />
                    </span>
                  </Tooltip>
                ) : null}
                {userProfile?.url && (
                  <a
                    className='profile-link'
                    href={userProfile.url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {userProfile.url
                      .replace(/^https?:\/\//i, '')
                      .replace(/\/$/, '')}
                  </a>
                )}
              </Space>
            </main>
            <nav>
              <Button.Group>
                <Button
                  type='ghost'
                  disabled={!notebook.meta?.created || loading.like}
                  onClick={handleLikeClick}
                >
                  {loading.like ? (
                    <LoadingOutlined />
                  ) : notebook.meta?.isLiked ? (
                    <HeartFilled style={{ color: 'var(--error-color)' }} />
                  ) : (
                    <HeartOutlined />
                  )}
                  {notebook?.stats?.like ? (
                    <> {notebook?.stats?.like}</>
                  ) : (
                    <></>
                  )}
                </Button>
                <Button
                  type='ghost'
                  disabled={!notebook.meta?.created || loading.star}
                  onClick={handleStarClick}
                >
                  {loading.star ? (
                    <LoadingOutlined />
                  ) : notebook.meta?.isStarred ? (
                    <StarFilled style={{ color: 'var(--warning-color)' }} />
                  ) : (
                    <StarOutlined />
                  )}
                  {notebook?.stats?.star ? (
                    <> {notebook?.stats?.star}</>
                  ) : (
                    <></>
                  )}
                </Button>
                <Button
                  type='ghost'
                  disabled={
                    !notebook.meta?.created || loading.fork || loading.forkReady
                  }
                  onClick={handleForkClick}
                >
                  {loading.fork ? (
                    <LoadingOutlined />
                  ) : loading.forkReady ? (
                    <CheckOutlined />
                  ) : notebook.meta?.isForked ? (
                    <ForkOutlined style={{ color: 'var(--primary-color)' }} />
                  ) : (
                    <ForkOutlined />
                  )}
                  {notebook?.stats?.fork ? (
                    <> {notebook?.stats?.fork}</>
                  ) : (
                    <></>
                  )}
                </Button>
                <Dropdown
                  overlay={documentMenu}
                  placement='bottomRight'
                  disabled={!notebook.meta?.created}
                  trigger={['click']}
                  visible={documentMenuVisible}
                  onVisibleChange={(visible) => setDocumentMenuVisible(visible)}
                >
                  <Button type='ghost'>
                    <MoreOutlined />
                  </Button>
                </Dropdown>
              </Button.Group>
            </nav>
            <aside>
              <VersionStatus notebook={notebook} publicView={publicView} />
              <span />
              {(notebook?.meta?.revision || isOwner) && (
                <RevisionStatus
                  publicView={publicView}
                  notebook={notebook}
                  isOwner={isOwner}
                />
              )}
            </aside>
            {!!notebook?.meta?.forkOf && (
              <aside>
                <ForkStatus notebook={notebook} />
              </aside>
            )}
            <aside>
              <NotebookTags notebook={notebook} editable={isOwner} />
            </aside>
          </StyledPageHeader>
        </Col>
        <Col flex='auto' />
      </Row>
    </>
  )
}

const VersionStatus = ({ notebook = {} }) => {
  const { isPublic, isPublished, isShared } = notebook?.meta || {}

  return (
    <Space className='published'>
      {isPublished ? (
        <>
          <GlobalOutlined />
          <span>
            <>
              <Link
                to={`/@${notebook.meta.createdBy}/${notebook.properties.name}:${notebook.meta.version}`}
              >
                v{notebook.meta.version}
              </Link>{' '}
              &mdash;{' '}
            </>
            {notebook.meta.released !== notebook.meta.published ? (
              <>
                Updated on&nbsp;
                <time dateTime={new Date(notebook.meta.released).toISOString()}>
                  {moment(notebook.meta.released).format('dddd, MMMM Do YYYY')}
                </time>
              </>
            ) : (
              <>
                Published on&nbsp;
                <time
                  dateTime={new Date(notebook.meta.published).toISOString()}
                >
                  {moment(notebook.meta.published).format('dddd, MMMM Do YYYY')}
                </time>
              </>
            )}
          </span>
        </>
      ) : isPublic ? (
        <>
          <LinkOutlined />
          <span>Public</span>
        </>
      ) : isShared ? (
        <>
          <TeamOutlined />
          <span>Shared</span>
        </>
      ) : (
        <>
          <UserOutlined />
          <span>Private</span>
        </>
      )}
    </Space>
  )
}

const RevisionStatus = ({ notebook = {}, isOwner, publicView }) => {
  const handleRevClick = useCallback(
    (event) => {
      if (event.metaKey) console.log('📓 Notebook:', notebook)
    },
    [notebook]
  )

  return (
    <Space className='revision' onClick={handleRevClick}>
      {isOwner && publicView ? (
        <Link to={`/d${notebook.notebookId}`}>
          <FileSyncOutlined />
          <span>
            {isOwner ? <>Last saved </> : <>Last update </>}
            <time dateTime={new Date(notebook.meta.published).toISOString()}>
              {moment(notebook.meta.published).fromNow()}
            </time>
          </span>
        </Link>
      ) : notebook?.meta?.updated ? (
        <>
          <FileSyncOutlined />
          <span>
            {isOwner ? <>Last saved </> : <>Last update </>}
            <time dateTime={new Date(notebook.meta.updated).toISOString()}>
              {moment(notebook.meta.updated).fromNow()}
            </time>
          </span>
        </>
      ) : (
        <>/</>
      )}
      {!isOwner && publicView && !notebook?.meta?.updated && (
        <>
          <FileAddOutlined />
          <span>Unsaved document</span>
        </>
      )}
    </Space>
  )
}

const ForkStatus = ({ notebook = {} }) => {
  const forkOf = notebook.meta?.forkOf?.replace(':', '/')
  return (
    notebook?.meta?.forkOf && (
      <Space className='fork'>
        <ForkOutlined />
        <span>
          Fork of{' '}
          {notebook.meta.forkVersion ? (
            <Link to={`/@${forkOf}:${notebook.meta.forkVersion}`}>
              @{forkOf}
            </Link>
          ) : (
            <Link to={`/d${forkOf}:${notebook.meta.forkRevision}`}>
              {forkOf}
            </Link>
          )}
        </span>
      </Space>
    )
  )
}

const StyledCopyModal = styled.div`
  .ant-checkbox-group {
    display: flex;
    flex-direction: column;
  }

  .ant-divider {
    margin: 5px;
  }
`

const StyledPageHeader = styled(PageHeader)`
  &.ant-page-header {
    padding-left: 0;
    padding-right: 0;
    background: transparent;
    .ant-page-header-heading-sub-title {
      /* margin-right: 0; */
    }

    .click-to-copy-import-location {
      cursor: pointer;
      font-weight: 300;
      transition: all 300ms;

      &:hover {
        transition: all 300ms;
        color: var(--primary-color);
      }
    }
    .ant-page-header-content {
      display: grid;
      grid-template-areas:
        'icon titles nav'
        'updates updates updates';
      grid-template-columns: 36px 1fr auto;
      grid-template-rows: 36px auto;
      grid-column-gap: 1rem;

      > .ant-avatar {
        grid-area: icon;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      > main {
        grid-area: titles;
        display: flex;
        align-items: flex-start;
        > .ant-space {
          display: flex;
          align-items: flex-start;
          > .ant-space-item {
            &:not(:nth-of-type(1)) {
              margin-top: -8px;
            }
          }
        }
        a {
          color: var(--font-body-color);
          &:hover {
            color: var(--primary-color);
          }
        }
        .profile {
          &-link {
            font-weight: normal;
            font-size: 11px;
          }
        }
      }
      > nav {
        grid-area: nav;
        display: flex;
        align-items: center;
      }
      > aside {
        padding: 0.5em 0;
        font-size: 11px;
        font-weight: normal;
        display: flex;
        align-items: center;
        &:first-of-type {
          grid-area: updates;
        }
        &:not(:first-of-type) {
          grid-column-start: updates-start;
          grid-column-end: updates-end;
          padding-top: 0;
        }
        > span:empty {
          flex: 1 1 auto;
        }
        > .ant-space {
          &.published,
          &.revision,
          &.fork {
            opacity: 0.7;
            transition: all 120ms ease-in-out;
            &:hover {
              opacity: 0.95;
            }
          }
        }
      }
    }
  }
`

export default NotebookHeader
