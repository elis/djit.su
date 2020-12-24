import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useHistory } from 'djitsu/adapters/routes'
import DocumentLayout from 'djitsu/components/document-layout'
import DocumentIFrame from 'djitsu/components/document-iframe'
import { Button, Result } from 'antd'
import { NotebookError } from 'djitsu/schema/notebook'
import { useUser } from 'djitsu/providers/user'
import { useNotebook } from 'djitsu/providers/notebook'

import hash from 'object-hash'
import RunnerHeader from 'djitsu/components/runner-header'

export const DocumentRunner = (props) => {
  const { documentId = 'new-document', revision, exported } =
    props.match.params || {}
  const [user, userActions] = useUser()

  const [state, notebookActions] = useNotebook(
    documentId,
    revision ? +revision : revision
  )

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

  const editorNotebook = useMemo(() => {
    const rety = {
      ...state.currentNotebook.notebook,
      ...(state.currentNotebook?.unsavedNotebook
        ? {
            blocks: state.currentNotebook?.unsavedNotebook?.blocks,
            meta: {
              ...state.currentNotebook.notebook?.meta,
              blocksTime:
                state.currentNotebook?.unsavedNotebook?.meta?.blocksTime
            }
          }
        : null)
    }

    return rety
  }, [state.currentNotebook])

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

  const history = useHistory()

  const [isRestricted] = useState()
  // Handle cases:
  // [√] New document
  // [√] User-owned document
  // [√] General manager access
  // [ ] Shared (user -> user) document
  // [ ] Private document (no access - not public/published, unpublished)
  // [√] Non-existing document [same as New document]

  useEffect(() => {
    if (
      state.currentNotebook.notebookId &&
      documentId !== state.currentNotebook.notebookId
    ) {
      // Redirect to the document id if document has an ID (after saving new document)
      history.replace('/d' + state.currentNotebook.notebookId)
    }
  }, [documentId, state.currentNotebook.notebookId])

  useEffect(() => {
    if (
      revision &&
      revision !== state.currentNotebook?.notebook?.meta?.revision
    ) {
      if (+revision < +state.currentNotebook?.notebook?.meta?.revision)
        // Redirect to the document id if document has an ID (after saving new document)
        history.replace(
          '/d' +
            state.currentNotebook.notebookId +
            ':' +
            state.currentNotebook?.notebook?.meta?.revision
        )
    }
  }, [revision, state.currentNotebook?.notebook?.meta?.revision])

  useEffect(() => {
    // load user profile
    const username = notebook?.meta?.createdBy
    if (username) {
      userActions.loadUserProfile(username)
    }
  }, [notebook?.meta?.createdBy])

  const userProfile =
    user.userProfiles[notebook?.meta?.createdBy || user.currentUsername]

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
  return revision &&
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
                    <Link to={`/d${documentId}`}>Latest Revision</Link>
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
            <RunnerHeader
              notebookId={documentId}
              notebook={notebook}
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
          {/* <pre>{JSON.stringify({ documentId, editorNotebook }, 1, 1)}</pre> */}
          {/* <pre>{JSON.stringify(state, 1, 1)}</pre> */}
        </DocumentLayout.Content>
      </DocumentLayout>
    </>
  )
}

export default DocumentRunner
