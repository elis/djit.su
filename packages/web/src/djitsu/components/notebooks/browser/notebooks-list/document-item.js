/* eslint-disable react/prop-types */
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Button,
  List,
  Menu,
  Skeleton,
  Card,
  Divider,
  Dropdown,
  Statistic,
  Space,
  Modal
} from 'antd'
import {
  DeleteOutlined,
  GlobalOutlined,
  FolderOutlined,
  LinkOutlined,
  SolutionOutlined,
  MoreOutlined,
  ForkOutlined,
  HeartOutlined,
  StarOutlined,
  CaretRightOutlined,
  HeartFilled,
  StarFilled
} from '@ant-design/icons'

import { Link } from 'react-router-dom'
import styled from 'styled-components'
import moment from 'moment'

import { toLongDate, timeAgo } from 'djitsu/adapters/date'
import useStates from 'djitsu/utils/hooks/use-states'
const { Meta } = Card

const DocumentItem = ({ item, onUpdate }) => {
  const [loads, setLoading] = useStates({
    delete: false
  })
  const [showDetails, setShowDetails] = useState()

  const [modal, contextHolder] = Modal.useModal()

  const onDelete = useCallback(
    async (action) => {
      const event = action.domEvent
      const { shiftKey } = event
      setShowDetails(false)
      console.log('delete:', shiftKey, action)

      if (!shiftKey) {
        modal.confirm({
          title: 'Delete Document',
          content: (
            <>
              <p>Are you sure you want to delete the document?</p>
            </>
          ),
          onOk: async () => {
            setLoading('delete', true)
            // await doks.actions.remove(item.docid)
            if (typeof onUpdate === 'function') await onUpdate()
            setLoading('delete', false)
            return true
          },
          onCancel: () => ({})
        })
      } else {
        setLoading('delete', true)
        // await doks.actions.remove(item.docid)
        if (typeof onUpdate === 'function') await onUpdate()
        setLoading('delete', false)
      }
    },
    [item]
  )

  const onDetails = useCallback((show) => {
    setShowDetails(show)
  }, [])

  const hasMain = useMemo(() => (item?.exports || []).indexOf('Main') !== -1, [
    item
  ])

  const runDoc = useCallback(
    (exportee, env = 'priv') => {
      if (env === 'priv')
        window.open(
          `/v${item.docid}${exportee === 'Main' ? '' : `/${exportee}`}`,
          'app-view'
        )
      else if (env === 'pub')
        window.open(
          `/@${item.username}/${item.name}${
            exportee === 'Main' ? '' : `/${exportee}`
          }`,
          'pub-view'
        )
    },
    [item]
  )

  const docMenu = (
    <Menu>
      {hasMain || item.exports?.length ? (
        <Menu.SubMenu
          title='Run'
          onTitleClick={() => runDoc('Main')}
          icon={<CaretRightOutlined />}
          key='run'
        >
          <Menu.ItemGroup title='Document Exports'>
            {(item?.exports || [])
              .filter((name) => name !== 'Main')
              .map((name) => (
                <Menu.Item key={name} onClick={() => runDoc(name)}>
                  {name}
                </Menu.Item>
              ))}
          </Menu.ItemGroup>
        </Menu.SubMenu>
      ) : hasMain ? (
        <Menu.Item
          key='run'
          exported='Main'
          onClick={() => runDoc('Main')}
          icon={<CaretRightOutlined />}
        >
          Run
        </Menu.Item>
      ) : null}
      <Menu.Divider />
      {item.public && (
        <Menu.Item key='copy-link' disabled icon={<LinkOutlined />}>
          Copy Public Link
        </Menu.Item>
      )}

      {item.published && (
        <Menu.ItemGroup title={item.pubver}>
          <Menu.Item
            key='run-published'
            icon={<GlobalOutlined />}
            onClick={() => runDoc('Main', 'pub')}
          >
            Visit Published
          </Menu.Item>
          <Menu.Item key='copy-published' disabled icon={<GlobalOutlined />}>
            Copy Published Link
          </Menu.Item>
        </Menu.ItemGroup>
      )}

      <Menu.Divider />
      <Menu.Item key='delete' danger onClick={onDelete}>
        <DeleteOutlined /> Delete Document
      </Menu.Item>
    </Menu>
  )

  const meta = (
    <div className='meta'>
      <div className='doc'>
        <DocumentVisibility
          isPublic={item.meta.isPublic}
          isPublished={item.meta.isPublished}
        />
        <Dropdown
          overlay={docMenu}
          trigger={['click']}
          className='doc-menu'
          placement='bottomRight'
          onVisibleChange={onDetails}
        >
          <Button size='small' shape='circle' type='primary'>
            <MoreOutlined />
          </Button>
        </Dropdown>
      </div>
      <Meta
        title={
          <Link to={`/d${item.notebookId}`}>
            {item.properties.title ||
              item.properties.name ||
              'd' + item.notebookId}
          </Link>
        }
        description={
          item.saved && (
            <>
              Last save:{' '}
              <time
                dateTime={toLongDate(item.saved)}
                title={toLongDate(item.saved)}
              >
                {timeAgo(item.saved)}
              </time>
            </>
          )
        }
      />
    </div>
  )

  const microStat = (
    <aside>
      {item.meta.isPublished && (
        <>
          <span className='public-name'>
            @{item.meta.createdBy}/{item.properties.name}
          </span>
          <Divider />
        </>
      )}
      <>
        <span className='id'>d{item.notebookId}</span>
      </>
    </aside>
  )

  const [loadingDoc] = useState()
  const [loadedDoc] = useState()
  const selfLoaded = loadedDoc === item.docid

  const handleDetailsChange = useCallback(async () => {
    if (showDetails && loadingDoc !== item.docid) {
      console.log('📑 What is item:', item)
      // const loadedAgo = Date.now() - (doc?.lastOpTime ?? 0)
      // if ((!doc && loadedDoc !== item.docid) || loadedAgo > 1000 * 60) {
      //   setLoadingDoc(item.docid)
      //   await doks.actions.load(item.docid)
      //   setLoadedDoc(item.docid)
      //   setLoadingDoc(false)
      // }
    }
  }, [showDetails, loadedDoc, loadingDoc, item.docid])

  useEffect(() => {
    handleDetailsChange()
  }, [showDetails])

  const detailedStats = useMemo(
    () => (
      <div className='data'>
        <Space direction='horizontal' size='small' align='end'>
          <Statistic
            title='Likes'
            prefix={
              item?.stats?.like ? (
                <HeartFilled style={{ color: 'var(--highlight-color)' }} />
              ) : (
                <HeartOutlined />
              )
            }
            value={item?.stats?.like || '-'}
          />
          <Divider type='vertical' />
          <Statistic
            title='Stars'
            prefix={
              item?.stats?.star ? (
                <StarFilled style={{ color: 'var(--warning-color)' }} />
              ) : (
                <StarOutlined />
              )
            }
            value={item?.stats?.star || '-'}
          />
          <Divider type='vertical' />
          <Statistic
            title='Forks'
            prefix={
              item?.stats?.fork ? (
                <ForkOutlined style={{ color: 'var(--primary-color)' }} />
              ) : (
                <ForkOutlined />
              )
            }
            value={item?.stats?.fork || '-'}
          />
        </Space>
        <Divider type='horizontal' />
        <Statistic
          title='Last Saved'
          value={moment(item.meta.updated).fromNow()}
        />
        {item.meta.isPublished && (
          <Statistic
            title='Last Published'
            value={moment(item.meta.released).fromNow()}
          />
        )}
        {item.meta.isPublished && (
          <Statistic
            title='Published Version'
            value={`v${item.meta.version}`}
          />
        )}
        {item.meta.isPublic && (
          <Statistic title='Link Sharing' value={`Enabled`} />
        )}
        {item.meta.isShared && (
          <Statistic title='Shared' value={`Name, name`} />
        )}
      </div>
    ),
    [
      item.docid,
      selfLoaded
    ]
  )

  const anyLoads = useMemo(() => Object.values(loads).find((v) => v), [loads])

  const onItemClick = useCallback(
    (event) => {
      if (event.metaKey) console.info('📘 Notebook:', item)
    },
    [item]
  )
  return (
    <List.Item onClick={onItemClick}>
      <Skeleton avatar title={false} loading={item.loading} active>
        <StyledDocumentCard
          bordered={false}
          size='small'
          className={`${showDetails ? 'detailed' : ''}${
            loadingDoc ? ' loading-doc' : ''
          }${anyLoads ? ' busy' : ''}`}
          cover={
            <Link to={`/d${item.notebookId}`} className='preview book'>
              {detailedStats}
              {item.properties?.previewPhotoUrl && (
                <div className='img'>
                  <div
                    className='bg-image'
                    style={{
                      backgroundImage: `url("${item.properties.previewPhotoUrl}")`
                    }}
                  />
                  {microStat}
                </div>
              )}
              {!item.properties?.previewPhotoUrl && (
                <div className='img'>
                  <div className='bg-image'>
                    <SolutionOutlined />
                  </div>
                  {microStat}
                </div>
              )}
              <div className='img-shadow' />
            </Link>
          }
        >
          {meta}
          {contextHolder}
        </StyledDocumentCard>
      </Skeleton>
    </List.Item>
  )
}
export const documentItem = ({ handleItemClick: onUpdate }) => (item) => {
  return <DocumentItem item={item} onUpdate={() => onUpdate(item.docid)} />
}

const DocumentVisibility = ({ isPublic, isPublished }) => {
  const label = isPublished ? 'Published' : isPublic ? 'Public' : 'Private'
  const icon = isPublished ? (
    <GlobalOutlined />
  ) : isPublic ? (
    <LinkOutlined />
  ) : (
    <FolderOutlined />
  )
  return (
    <StyledDocVis>
      {icon}
      <span>{label}</span>
    </StyledDocVis>
  )
}

const StyledDocVis = styled.span`
  display: inline-flex;
  align-items: center;

  > .anticon {
    margin-right: 0.5em;
  }
`

const borderRadius = '5px'

const StyledDocumentCard = styled(Card)`
  --book-background: var(--editor-group-background);
  &.ant-card {
    .djs-theme.light &,
    .djs-theme.dark & {
      background: none;
    }
    > .ant-card-body {
      max-width: 150px;
    }

    .book {
      border-top-right-radius: ${borderRadius};
      border-bottom-right-radius: ${borderRadius};

      cursor: pointer;
      display: block;
      width: 150px;
      height: 190px;
      position: relative;
      /* background: var(--tool-background-color); */
      background: none;
      z-index: 1;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1),
        0 9px 20px 0 rgba(0, 0, 0, 0.25);

      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05), 0 2px 2px rgba(0, 0, 0, 0.05),
        0 4px 4px rgba(0, 0, 0, 0.05), 0 8px 8px rgba(0, 0, 0, 0.05);
      /* overflow: hidden; */
      transition: box-shadow 0.3s linear;
      perspective-origin: left;
      perspective: 1500px;
      /* border: 1px solid #0FF; */

      > .data {
        text-align: right;
        width: calc(100% - 16px);
        padding-top: 8px;
        max-height: calc(100% - 8px);
        overflow: hidden;

        .ant-statistic {
          &-title {
            font-size: 8px;
          }
          &-content {
            font-size: 10px;
            &-suffix {
              font-size: 9px;
              margin-left: 0.25em;
            }
          }
        }
        .ant-divider.ant-divider-vertical {
          margin: 0;
        }
        .ant-divider.ant-divider-horizontal {
          margin: 10px 0;
        }
      }
    }

    .book .img {
      border-top-right-radius: ${borderRadius};
      border-bottom-right-radius: ${borderRadius};
      /* border: 1px solid #0F0; */

      width: inherit;
      height: inherit;
      transform-origin: 0 50%;
      transform: rotateY(0);
      /* transform: rotateY(-35deg); */
      transition: all 0.45s ease;
      /* background-color: var(--tool-background-color); */
      background-color: var(--book-background);
      position: absolute;
      top: 0;
      left: -1px;
      box-shadow: 1px 1px 5px 5px rgba(0, 0, 0, 0);
      z-index: 3;

      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      backface-visibility: hidden;
      &::before {
        content: '';
        display: block;
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        transform: rotateX(180deg);
        backface-visibility: visible;

        /* background: var(--tool-background-color); */
        background-color: var(--book-background);
        border-radius: ${borderRadius};
      }
      > .bg-image {
        position: absolute;
        border-top-right-radius: ${borderRadius};
        border-bottom-right-radius: ${borderRadius};
        top: 0;
        right: 0;
        left: 6px;
        border-left: 1px solid var(--editor-group-border);
        bottom: 0;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-repeat: no-repeat;
        background-size: cover;
        backface-visibility: hidden;
        > .anticon {
          font-size: 48px;
        }
        &::after {
          content: '';
          background: inherit;
          transform: rotate(90deg);
          left: -1px;
          position: absolute;
          /* border: 1px solid #F0F; */
          width: 190px;
          height: 5px;
          top: 0;
          transform-origin: left top;
          background-size: cover;
          opacity: 0.6;
        }
      }
      > aside {
        position: relative;
        z-index: 11;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        padding: 0.5em 0.25em 0.5em 1em;
        pointer-events: none;
        color: var(--font-body-color);
        border-bottom-right-radius: ${borderRadius};
        overflow: hidden;

        span {
          &.id {
            font-size: 10px;
          }
        }
        > .ant-divider {
          margin: 0.2em 0;
          margin-left: -0.25em;
        }
        a {
          color: var(--font-body-color);
        }
        > * {
          position: relative;
          z-index: 11;
        }
        &::before {
          z-index: 9;
          content: '';
          display: block;
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          /* background: var(--tool-background-color); */
          background-color: var(--book-background);
          border-top: 1px solid var(--editor-group-border);
          opacity: 0.85;
        }
      }

      > .meta {
        position: relative;
        /* left: 0;
        right: 0;
        bottom: 0;
         */
        z-index: 11;
        display: flex;
      }

      &-shadow {
        position: absolute;
        display: block;
        left: 0;
        top: 0;
        width: 95%;
        height: 100%;
        background: rgba(0, 0, 0, 0.1);
        filter: blur(1px);
        z-index: 2;
      }
      &,
      &-shadow {
        transition: all 200ms ease-out;
      }
    }

    .book:hover {
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15), 0 2px 2px rgba(0, 0, 0, 0.15),
        0 4px 4px rgba(0, 0, 0, 0.15), 0 8px 8px rgba(0, 0, 0, 0.15);

      .img {
        transform: rotateY(-25deg);
        box-shadow: 1px 1px 5px 5px rgba(0, 0, 0, 0);
        &-shadow {
          width: 80%;
          background: rgba(0, 0, 0, 0.4);
          filter: blur(3px);
        }
      }
    }

    .book::after,
    .book::before {
      border-top-right-radius: calc(${borderRadius} + 3px);
      border-bottom-right-radius: calc(${borderRadius} + 3px);

      content: '';
      display: block;
      width: inherit;
      height: inherit;
      position: absolute;
      z-index: -1;
      top: 0;
      /* background-color: var(--tool-background-color); */
      background-color: var(--book-background);
      border: 1px solid var(--editor-group-border);
      left: 0;
    }

    .book::before {
      width: calc(100% - 3px);
    }
    .book::after {
      width: calc(100% - 6px);
    }

    > .ant-card-body {
      padding: 8px 0 0;
      font-size: 12px;
      > .meta {
        > .doc {
          display: flex;
          align-items: center;
          > .doc-menu {
            margin-left: auto;
            transition: all 80ms ease-out;
            &:not(:hover):not(.ant-dropdown-open) {
              color: inherit;
              background: transparent;
              border-color: transparent;
              box-shadow: none;
            }
            &:hover,
            &.ant-dropdown-open {
              background: var(--primary-color);
              border-color: var(--primary-color);
            }
          }
        }
        .ant-card-meta-title {
          margin-top: 4px;
          margin-bottom: 0;
        }
      }
    }
  }
  &.detailed {
    .book:not(:hover) {
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15), 0 2px 2px rgba(0, 0, 0, 0.15),
        0 4px 4px rgba(0, 0, 0, 0.15), 0 8px 8px rgba(0, 0, 0, 0.15);

      .img {
        transform: rotateY(-85deg);
        box-shadow: 1px 1px 5px 5px rgba(0, 0, 0, 0);
        &-shadow {
          width: 20%;
          filter: blur(8px);
          background: rgba(0, 0, 0, 0.2);
          transform: scale(1.15);
        }
      }
    }
    .book:hover {
      .img {
        transform: rotateY(-75deg);
        box-shadow: 1px 1px 5px 5px rgba(0, 0, 0, 0);
        &-shadow {
          width: 30%;
          filter: blur(7px);
          background: rgba(0, 0, 0, 0.2);
          transform: scale(1.12);
        }
      }
    }
    &.loading-doc {
      .book:not(:hover) {
        .img {
          transform: rotateY(-45deg);
          box-shadow: 1px 1px 5px 5px rgba(0, 0, 0, 0);
          &-shadow {
            width: 60%;
            filter: blur(4px);
            background: rgba(0, 0, 0, 0.15);
            transform: scale(1.1);
          }
        }
      }
    }
  }

  &.busy {
    /* transition: all  */
    animation: pulse 2.4s infinite;
    pointer-events: none;
  }

  @keyframes pulse {
    0% {
      opacity: 0.9;
    }
    50% {
      opacity: 0.3;
    }
    100% {
      opacity: 0.9;
    }
  }
`

export default documentItem
