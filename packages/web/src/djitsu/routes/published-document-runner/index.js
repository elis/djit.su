import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'djitsu/adapters/routes'
import DocumentLayout from 'djitsu/components/document-layout'
import DocumentIFrame from 'djitsu/components/document-iframe'
import { Button, Result } from 'antd'
import { NotebookError } from 'djitsu/schema/notebook'
import { useUser } from 'djitsu/providers/user'
import { useNotebook } from 'djitsu/providers/notebook'

import hash from 'object-hash'
import RunnerHeader from 'djitsu/components/runner-header'

export const DocumentRunner = (props) => {
  const { username, notebookName, version, exported } = props.match.params || {}
  const [user, userActions] = useUser()
  const [myId, setMyId] = useState()

  const [state, notebookActions] = useNotebook()

  const editorNotebook = state.notebooks[myId]
  const isReady =
    !!editorNotebook &&
    (!editorNotebook.status?.loading || !state.currentNotebook.resetting) &&
    !state.currentNotebook.resetting

  const userProfile =
    isReady && user.userProfiles[editorNotebook.meta.createdBy]

  const loadNotebook = async (notebookName, username, version) => {
    const result = await notebookActions.getNotebookByName(
      notebookName,
      username,
      version
    )
    await userActions.loadUserProfile(result.meta.createdBy)
    setMyId(result.notebookId)
    notebookActions.setCurrentNotebookId(result.notebookId)
  }

  useEffect(() => {
    loadNotebook(notebookName, username, version)
  }, [notebookName, username, version])

  useEffect(() => {
    notebookActions.setDocumentView(false)
  }, [])

  useEffect(() => {
    if (state.currentNotebook?.notebookId) {
      if (
        state.currentNotebook?.unsavedNotebook?.notebookId &&
        state.currentNotebook.unsavedNotebook.notebookId !==
          state.currentNotebook.notebookId
      ) {
        notebookActions.clearTemp()
      }
    }
  }, [state.currentNotebook?.notebookId])

  const notebook = state.currentNotebook?.notebook

  const isNotebookReady =
    editorNotebook &&
    (!editorNotebook.status?.loading || !state.currentNotebook.resetting)

  const nsRef = useRef()
  const getFreshNotebookState = useCallback(() => nsRef.current, [
    nsRef.current
  ])
  useEffect(() => {
    nsRef.current = state
  }, [state])

  const onChangeNext = useCallback((editorDocument) => {
    const newBlocks = editorDocument?.blocks
    const newCompiled = editorDocument?.compiled
    const latest = getFreshNotebookState()
    const oldBlocks = latest?.currentNotebook?.notebook?.blocks
    const oldCompiled = latest?.currentNotebook?.notebook?.compiled
    const newHash = hash({ blocks: newBlocks, compiled: newCompiled })
    const oldHash = hash({ blocks: oldBlocks, compiled: oldCompiled })

    if (newHash !== oldHash) {
      notebookActions.onNotebookChange(
        newBlocks,
        {},
        newCompiled,
        editorDocument.time
      )
    }
  }, [])

  const [isRestricted] = useState()
  // Handle cases:
  // [√] New document
  // [√] User-owned document
  // [√] General manager access
  // [ ] Shared (user -> user) document
  // [ ] Private document (no access - not public/published, unpublished)
  // [√] Non-existing document [same as New document]

  const isNotebook = async (username, notebookName) => {
    try {
      await notebookActions.getNotebookId(notebookName, username)
      return true
    } catch (error) {
      return false
    }
  }
  const getNotebook = async (username, notebookName, version) => {
    try {
      const result = await notebookActions.getNotebookByName(
        notebookName,
        username,
        version
      )
      return result
    } catch (error) {
      console.log('error getting notebok:', error)
    }
  }

  return isReady &&
    isNotebookReady &&
    (notebook?.status?.error === NotebookError.Unavailable ||
      notebook?.status?.error === NotebookError.RevisionUnavailable) ? (
    <>
      <DocumentLayout>
        <DocumentLayout.Header></DocumentLayout.Header>
        <DocumentLayout.Content>
          <Result
            status='404'
            title={
              notebook?.status?.error === NotebookError.Unavailable ? (
                <>Notebook unavailable - cannot load revision</>
              ) : (
                <>Revision unavailable</>
              )
            }
            subTitle={
              notebook?.status?.error === NotebookError.Unavailable ? (
                <>The notebooke you are trying to access is not available</>
              ) : (
                <>The revision you are trying to acces is not available</>
              )
            }
            extra={
              notebook?.status?.error === NotebookError.Unavailable ? (
                <>
                  <Button type='primary'>
                    <Link to='/'>Home</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button type='primary'>
                    <Link to={`/@${username}/${notebookName}`}>
                      Latest Version
                    </Link>
                  </Button>
                  <Button>
                    <Link to='/'>Home</Link>
                  </Button>
                </>
              )
            }
          />
        </DocumentLayout.Content>
      </DocumentLayout>
    </>
  ) : (
    <>
      <DocumentLayout>
        <DocumentLayout.Header>
          {editorNotebook && userProfile && (
            // <>HEADER</>
            <RunnerHeader
              publicView
              notebookName={editorNotebook.properties.name}
              notebook={editorNotebook}
              userProfile={userProfile}
              user={user}
              exported={exported}
            />
            // <NotebookHeader
            //   notebookId={documentId}
            //   notebook={editorNotebook}
            //   userProfile={userProfile}
            //   user={user}
            // />
          )}
        </DocumentLayout.Header>
        <DocumentLayout.Content>
          {!isRestricted && isNotebookReady && (
            // <>IFRAME</>
            <DocumentIFrame
              isHost
              notebook={editorNotebook}
              onChange={onChangeNext}
              exported={exported}
              isNotebook={isNotebook}
              getNotebook={getNotebook}
            />
          )}
          {isRestricted && (
            <Result
              status='500'
              title='Document Restricted'
              subTitle="The document you're trying to access is restricted or unavailable."
              extra={
                <>
                  <Button type='primary'>
                    <Link to='/'>Home</Link>
                  </Button>
                </>
              }
            />
          )}
          {/* <pre>{JSON.stringify(state, 1, 1)}</pre> */}
        </DocumentLayout.Content>
      </DocumentLayout>
    </>
  )
}

export default DocumentRunner
