import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useHistory } from 'djitsu/adapters/routes'
import {
  Button,
  Checkbox,
  Divider,
  Dropdown,
  Menu,
  notification,
  Space,
  Statistic
} from 'antd'
import {
  CaretDownOutlined,
  CaretUpOutlined,
  FileSyncOutlined,
  ForkOutlined,
  LoadingOutlined,
  UndoOutlined
} from '@ant-design/icons'
import { NotebookError } from 'djitsu/schema/notebook'
import styled from 'styled-components'
import useStates from 'djitsu/utils/hooks/use-states'
import { useNotebook } from 'djitsu/providers/notebook'
import { useUser } from 'djitsu/providers/user'

export const DocumentButton = () => {
  // const [notebookState, notebookActions] = useNotebook()
  const [notebookStateNext, notebookActionsNext] = useNotebook()
  const [isSaving, setSaving] = useState()
  const [showSaveErrorNotice, setShowSaveErrorNotice] = useState()
  const [dontShowAgainWarning, setDontShowAgainWarning] = useState()
  const [api, contextHolder] = notification.useNotification()
  const [user] = useUser()
  const history = useHistory()
  const [isMenuOpen, setMenuOpen] = useState()

  // const [nstate, nactions] = useNotebook()

  // useEffect(() => {
  //   console.log('NOTEBOOK NEXT UPDATE IN DOCUMENT BUTTON', nstate)
  //   if (!nactions) console.log('aww')
  // }, [nstate])

  // const notebook = notebookState.currentId
  //   ? notebookState.notebooks[notebookState.currentId]
  //   : null
  const notebook = notebookStateNext.currentNotebook?.notebook

  const isOwner = useMemo(
    () =>
      notebookStateNext.currentNotebook.notebookId === 'new-document' ||
      notebook?.meta?.createdBy === user?.currentUsername ||
      (!notebook?.meta?.createdBy && user?.currentUsername),
    [notebook, user, notebookStateNext]
  )

  const onClickSave = useCallback(
    async (useFork) => {
      setSaving(true)
      try {
        if (useFork || !isOwner) {
          const forkId = await notebookActionsNext.saveFork()
          api.success({
            message: <>Notebook Forked Successfully</>,
            icon: <ForkOutlined />
          })
          history.push(`/d${forkId}`, { fork: true })
        } else {
          const resultId = await notebookActionsNext.saveCurrent()
          if (resultId !== notebookStateNext.currentNotebook.notebookId)
            history.push(`/d${resultId}`)
        }
      } catch (error) {
        console.log('Error saving:', error)
      }
      setMenuOpen(false)
      setSaving()
    },
    [isOwner, notebookStateNext]
  )

  // const onClickSaveXi = useCallback(async () => {
  //   if (isSaving) {
  //     return
  //   }
  //   console.log('%c&&&&&&& SAVING STARTED', 'color: blue')

  //   setSaving(true)

  //   if (
  //     notebookState.canSave ||
  //     notebookState.isNewDocument ||
  //     !notebookState.lastSaveTime
  //   ) {
  //     try {
  //       await notebookActions.saveCurrent()
  //     } catch (error) {
  //       if (error === NotebookError.NoUser) {
  //         setShowSaveErrorNotice(true)
  //       } else {
  //         // Show error message UI
  //         api.warning({
  //           onClose: () => {
  //             setShowSaveErrorNotice(false)
  //           },
  //           message: `${error?.code || error}`,
  //           description: error?.message,
  //           duration: 50,
  //           placement: 'topRight',
  //           top: 60
  //         })
  //       }
  //     }
  //     setSaving(false)
  //     console.log('%c&&&&&&& SAVING COMPLETE', 'color: blue')
  //   } else {
  //     const tid = setTimeout(() => {
  //       setSaving(false)
  //     }, 800)
  //     return () => clearTimeout(tid)
  //   }
  // }, [notebookState, isSaving])

  useEffect(() => {
    if (!dontShowAgainWarning && showSaveErrorNotice)
      // Show error unable to save
      api.warning({
        onClose: () => {
          setShowSaveErrorNotice(false)
        },
        message: `Unable to save your work`,
        description: (
          <>
            <Space direction='vertical'>
              <p>Your work cannot be saved while you&apos;re signed out</p>
              <Space>
                <Button type='primary' block>
                  <Link to='/login'>Log In</Link>
                </Button>
                <Button block>
                  <Link to='/signup'>Create Account</Link>
                </Button>
              </Space>
              <Divider orientation='center'>🛠</Divider>
              <Space>
                <Checkbox
                  onChange={({ target: { checked } }) => {
                    setDontShowAgainWarning(checked)
                  }}
                >
                  Dont show this again
                </Checkbox>
              </Space>
            </Space>
          </>
        ),
        duration: 0,
        placement: 'topRight',
        top: 60
      })
  }, [showSaveErrorNotice])

  const [loadingMenues, setLoadingMenu] = useStates()

  const handleMenuClick = async ({ key }) => {
    if (key === 'reset-to-revision') {
      setLoadingMenu('reset-to-revision', true)
      const done = notebookActionsNext.resetCurrent()
      await notebookActionsNext.loadNotebook(
        notebookStateNext.currentNotebook.notebookId
      )
      done()
      setLoadingMenu('reset-to-revision', false)
      return true
    }
    if (key === 'save-fork') {
      setLoadingMenu('saving-fork', true)
      await onClickSave(true)
      setLoadingMenu('saving-fork', false)
    }
  }

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item
        icon={
          loadingMenues['saving-fork'] ? <LoadingOutlined /> : <ForkOutlined />
        }
        key='save-fork'
      >
        Save Fork
      </Menu.Item>
      <Menu.Divider />
      <DataItem icon={<FileSyncOutlined />} key='revision' disabled>
        <Statistic title='Notebook Revision' value={notebook?.meta?.revision} />
      </DataItem>

      <Menu.Item
        icon={
          loadingMenues['reset-to-revision'] ? (
            <LoadingOutlined />
          ) : (
            <UndoOutlined />
          )
        }
        key='reset-to-revision'
      >
        Reset to last save
      </Menu.Item>
    </Menu>
  )

  const notebookUnavailable =
    notebookStateNext.currentNotebook?.notebook?.status?.error ===
    NotebookError.Unavailable

  return (
    <>
      {contextHolder}
      {notebookStateNext.isDocumentView &&
      (!notebook?.status?.error ||
        notebook.error === NotebookError.Unavailable ||
        notebook.error === NotebookError.RevisionUnavailable) &&
      notebookStateNext.currentNotebook.notebookId ? (
        <Dropdown.Button
          overlay={menu}
          // getPopupContainer={() =>
          //   document.querySelector('.djitter-app .djs-theme')
          // }
          type={
            showSaveErrorNotice
              ? 'danger'
              : notebookStateNext.currentNotebook?.unsavedNotebook
              ? 'primary'
              : 'ghost'
          }
          onClick={() => onClickSave()}
          trigger={['click']}
          icon={
            isSaving ? (
              <LoadingOutlined />
            ) : isMenuOpen ? (
              <CaretUpOutlined style={{ fontSize: '0.8em' }} />
            ) : (
              <CaretDownOutlined style={{ fontSize: '0.8em' }} />
            )
          }
          onVisibleChange={(vis) => {
            setMenuOpen(vis)
          }}
          visible={isMenuOpen}
        >
          <>Save {!isOwner && <>Fork</>}</>
        </Dropdown.Button>
      ) : notebookStateNext.isDocumentView &&
        notebookStateNext.currentNotebook.notebookId &&
        notebookUnavailable ? (
        <Button
          onClick={() => onClickSave()}
          type={
            showSaveErrorNotice
              ? 'danger'
              : notebookStateNext.currentNotebook?.unsavedNotebook
              ? 'primary'
              : 'ghost'
          }
          icon={isSaving ? <LoadingOutlined /> : null}
        >
          Save
        </Button>
      ) : (
        <Button type='primary'>
          <Link to='/create-new'>Create New</Link>
        </Button>
      )}
    </>
  )
}

const DataItem = styled(Menu.Item)`
  .ant-statistic {
    display: inline-flex;
    flex-direction: row;
    font-size: 1em;
    > .ant-statistic-title {
      flex: 1 1 auto;
      font-size: inherit;
      margin-right: 1em;
    }
    > .ant-statistic-content {
      font-size: inherit;
      > .ant-statistic-content-value {
        > .ant-statistic-content-value-int {
        }
      }
    }
  }
`

export const DataSubmenu = styled(Menu.SubMenu)`
  .ant-statistic {
    display: inline-flex;
    flex-direction: row;
    font-size: 1em;
    > .ant-statistic-title {
      flex: 1 1 auto;
      font-size: inherit;
      margin-right: 1em;
    }
    > .ant-statistic-content {
      font-size: inherit;
      > .ant-statistic-content-value {
        > .ant-statistic-content-value-int {
        }
      }
    }
  }
`

export default DocumentButton
