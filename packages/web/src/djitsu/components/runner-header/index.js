/* eslint-disable react/prop-types */
import React, { useMemo, useCallback, useRef, useState } from 'react'
import {
  message,
  Row,
  Col,
  PageHeader,
  Space,
  Button,
  Avatar,
  Menu,
  Dropdown,
  Breadcrumb
} from 'antd'
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
  TeamOutlined,
  CaretDownFilled,
  CaretUpFilled,
  RightOutlined,
  MinusOutlined
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { useHistory } from 'djitsu/adapters/routes'

export const RunnerHeader = (props) => {
  const history = useHistory()
  const {
    publicView,
    notebook,
    userProfile,
    notebookId,
    notebookName,
    user,
    exported
  } = props
  const dok = { actions: {}, state: {} }
  const appRef = useRef()

  const { isPublic, isPublished, createdBy } = notebook?.meta || {}
  const isOwner = useMemo(() => createdBy === user.currentUsername, [createdBy])

  const handleMenuClick = useCallback(
    async ({ key }) => {
      if (key === 'run') {
        const appView = window.open(`/d${notebookId}/Main`, 'app-view')
        appRef.current = appView
      } else if (key === 'share') {
        await dok.actions.share()
        message.info('Your document can now be accessed by anyone with a link')
      } else if (key === 'unshare') {
        dok.actions.share(false)
      } else if (key === 'publish') {
        dok.actions.publish()
      }
    },
    [isPublic, isPublished, notebookId]
  )

  const hasMain = useMemo(
    () => !!notebook?.compiled?.exports?.indexOf('Main') >= 0,
    [notebook]
  )

  const documentMenu = useMemo(
    () => (
      <Menu onClick={handleMenuClick}>
        {hasMain && (
          <Menu.Item key='run' icon={<CaretRightOutlined />}>
            App View
          </Menu.Item>
        )}
        {hasMain && isOwner && <Menu.Divider />}
        {isOwner && !isPublic && (
          <Menu.Item key='share' icon={<LinkOutlined />}>
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
      </Menu>
    ),
    [isPublic, isPublished, hasMain, isOwner]
  )

  // useEffect(() => {
  //   console.log(
  //     'notebook, userProfile, notebookId, isOwner UPDATED FOR HEADER:',
  //     { notebook, userProfile, notebookId, isOwner }
  //   )
  // }, [notebook, userProfile, notebookId, isOwner])
  // console.log(
  //   '📒 notebook, userProfile, notebookId, isOwner UPDATED FOR HEADER:',
  //   { notebook, userProfile, notebookId, isOwner }
  // )

  const [isVisible, setIsVisible] = useState()
  return !notebook ? (
    <>...</>
  ) : (
    <>
      <StyledRunnerHeader>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to='/'>
                <span style={{ fontSize: 16 }}>⟑</span>
              </Link>
            </Breadcrumb.Item>

            {!notebookName && (
              <Breadcrumb.Item>
                <Link to='/notebooks'>Notebooks</Link>
              </Breadcrumb.Item>
            )}
            {!notebookName && (
              <Breadcrumb.Item>
                <Link to={`/d${notebookId}`}>
                  {notebook.properties?.title || notebookId}
                </Link>
              </Breadcrumb.Item>
            )}
            {notebookName && (
              <Breadcrumb.Item>
                <Link to={`/@${notebook.meta.createdBy}`}>
                  {notebook.meta.createdBy}
                </Link>
              </Breadcrumb.Item>
            )}
            {notebookName && (
              <Breadcrumb.Item>
                <Link to={`/@${notebook.meta.createdBy}/${notebookName}`}>
                  {notebookName}
                </Link>
              </Breadcrumb.Item>
            )}

            <Breadcrumb.Item>
              {notebook.compiled.exports.length > 1 ? (
                <Dropdown
                  visible={isVisible}
                  trigger={['click']}
                  onVisibleChange={(vis) => setIsVisible(vis)}
                  overlay={
                    <Menu
                      onClick={() => {
                        // console.log('menu clicked', e)
                        setIsVisible(false)
                      }}
                    >
                      {notebook.compiled.exports.map((e) => (
                        <Menu.Item
                          key={`exported-${e}`}
                          onClick={() => {
                            publicView
                              ? history.push(
                                  `/@${createdBy}/${notebookName}/${e}`
                                )
                              : history.push(`/d${notebookId}/${e}`)
                          }}
                          icon={
                            exported === e ? (
                              <RightOutlined />
                            ) : (
                              <MinusOutlined />
                            )
                          }
                        >
                          {publicView ? (
                            <Link to={`/@${createdBy}/${notebookName}/${e}`}>
                              {e}
                            </Link>
                          ) : (
                            <Link to={`/d${notebookId}/${e}`}>{e}</Link>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu>
                  }
                >
                  <a
                    onClick={(e) => {
                      setIsVisible(!isVisible)
                      e.preventDefault()
                    }}
                    href={'#'}
                  >
                    {exported}{' '}
                    {isVisible ? (
                      <CaretUpFilled style={{ fontSize: '0.8em' }} />
                    ) : (
                      <CaretDownFilled style={{ fontSize: '0.8em' }} />
                    )}
                  </a>
                </Dropdown>
              ) : publicView ? (
                <Link to={`/@${createdBy}/${notebookName}/${exported}`}>
                  {exported}
                </Link>
              ) : (
                <Link to={`/d${notebookId}/${exported}`}>{exported}</Link>
              )}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col flex='auto' />
        <Col>
          {publicView ? (
            <VersionStatus notebook={notebook} />
          ) : (
            <RevisionStatus notebook={notebook} />
          )}
        </Col>
      </StyledRunnerHeader>
      {/* <pre>{JSON.stringify(notebook, 1, 1)}</pre> */}
      {!exported && (
        <Row>
          <Col flex='auto' />
          <Col flex='650px'>
            <StyledPageHeader>
              <Helmet>
                <title>{notebook?.properties?.title || notebookId}</title>
              </Helmet>
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
                  <Space direction='horizontal' size='small'>
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
                  <Button type='ghost' disabled={!notebook.meta?.created}>
                    <HeartOutlined />
                  </Button>
                  <Button type='ghost' disabled={!notebook.meta?.created}>
                    <StarOutlined />
                  </Button>
                  <Dropdown
                    overlay={documentMenu}
                    placement='bottomRight'
                    disabled={!notebook.meta?.created}
                    trigger={['click']}
                  >
                    <Button type='ghost'>
                      <MoreOutlined />
                    </Button>
                  </Dropdown>
                </Button.Group>
              </nav>
              <aside>
                <VersionStatus notebook={notebook} />
                <span />
                <RevisionStatus notebook={notebook} />
              </aside>
            </StyledPageHeader>
          </Col>
          <Col flex='auto' />
        </Row>
      )}
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
          {notebook.meta.released !== notebook.meta.published && (
            <span>
              v{notebook.meta.version} &mdash; Published on&nbsp;
              <time dateTime={new Date(notebook.meta.published).toISOString()}>
                {moment(notebook.meta.published).format('dddd, MMMM Do YYYY')}
              </time>
            </span>
          )}
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

const RevisionStatus = ({ notebook = {} }) => {
  return (
    <Space className='revision'>
      {notebook?.meta?.updated && (
        <>
          <FileSyncOutlined />
          <span>
            Last updated{' '}
            <time dateTime={new Date(notebook.meta.created).toISOString()}>
              {moment(notebook.meta.updated).fromNow()}
            </time>
          </span>
        </>
      )}
    </Space>
  )
}

const StyledRunnerHeader = styled(Row)`
  &.ant-row {
    > .ant-col {
      min-height: 20px;
      display: flex;
      align-items: center;
      .revision {
        opacity: 0.6;
      }
    }
  }
`

const StyledPageHeader = styled(PageHeader)`
  &.ant-page-header {
    padding-left: 0;
    padding-right: 0;
    .ant-page-header-heading-sub-title {
      /* margin-right: 0; */
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
        grid-area: updates;
        padding: 0.5em 0;
        font-size: 11px;
        font-weight: normal;
        display: flex;
        > span:empty {
          flex: 1 1 auto;
        }
        > .ant-space {
          &.published,
          &.revision {
            opacity: 0.7;
          }
        }
      }
    }
  }
`

export default RunnerHeader
