import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useHistory } from 'djitsu/adapters/routes'
import { useLocation } from 'react-router-dom'
import DocumentLayout from 'djitsu/components/document-layout'
// import { useNotebook } from 'djitsu/providers/notebook'
import DocumentIFrame from 'djitsu/components/document-iframe'
import { NotebookError } from 'djitsu/schema/notebook'
// import consoleError from 'djitsu/utils/console-error'
import NotebookHeader from 'djitsu/components/notebook-header'
import { useUser } from 'djitsu/providers/user'
import { useNotebook } from 'djitsu/providers/notebook'
import { useRestrictedFlow } from 'djitsu/flows/notebook/restricted'

import hash from 'object-hash'

const newDocumentBlocks = [
  {
    type: 'header',
    data: {
      text: 'Unnamed Notebook',
      level: 1
    }
  },
  {
    type: 'paragraph',
    data: {
      text: 'Type here...'
    }
  }
]

export const PublishedDocument = (props) => {
  const { username, notebookName, version } = props.match.params || {}
  // const [isReady, setIsReady] = useState()
  const [myId, setMyId] = useState()
  const [notebook, notebookActions] = useNotebook()
  const [user, userActions] = useUser()
  /** @type {Partial<import('djitsu/schema/notebook').Notebook>} */
  const editorNotebook = notebook.notebooks[myId]
  const isReady =
    !!editorNotebook &&
    (!editorNotebook.status?.loading || !notebook.currentNotebook.resetting) &&
    !notebook.currentNotebook.resetting

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
    if (user.currentUsername === username) notebookActions.setDocumentView(true)
    return () => notebookActions.setDocumentView(false)
  }, [user, username])

  const onChangeNext = (modifiedDocument) => {
    notebookActions.onNotebookChange(
      modifiedDocument.blocks,
      {},
      modifiedDocument.compiled,
      modifiedDocument.time
    )
  }

  const isNotebook = async (username, notebookName, version) => {
    try {
      await notebookActions.getNotebookId(notebookName, username, version)
      return true
    } catch {
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
  return (
    <>
      {isReady && (
        // <>Ready!</>
        <>
          <NotebookHeader
            publicView
            notebook={editorNotebook}
            userProfile={userProfile}
            notebookId={myId}
          />
          <DocumentIFrame
            isHost
            isEditor
            notebook={editorNotebook}
            newDocumentBlocks={newDocumentBlocks}
            onChange={onChangeNext}
            isNotebook={isNotebook}
            getNotebook={getNotebook}
          />
        </>
      )}
    </>
  )
}
export const PublishedDocumentX = (props) => {
  const { documentId, revision } = props.match.params || {}
  const [user, userActions] = useUser()
  const [[previousId, previousRevision], _setPreviousIdRev] = useState([])
  const setPreviousIdRev = (...idrev) => _setPreviousIdRev(idrev)

  const [notebookNextState, notebookNextActions] = useNotebook(
    documentId,
    revision ? +revision : revision
  )

  useEffect(() => {
    return () => {
      notebookNextActions.setCurrentNotebookId('')
    }
  }, [])

  useEffect(() => {
    if (notebookNextState.currentNotebook?.notebookId) {
      if (
        notebookNextState.currentNotebook?.unsavedNotebook?.notebookId &&
        notebookNextState.currentNotebook.unsavedNotebook.notebookId !==
          notebookNextState.currentNotebook.notebookId
      ) {
        notebookNextActions.clearTemp()
      }
    }
  }, [notebookNextState.currentNotebook?.notebookId])

  const notebook = notebookNextState.currentNotebook?.notebook

  const editorNotebook = useMemo(() => {
    const rety = {
      ...notebookNextState.currentNotebook.notebook,
      ...(notebookNextState.currentNotebook?.unsavedNotebook
        ? {
            blocks: notebookNextState.currentNotebook?.unsavedNotebook?.blocks,
            meta: {
              ...notebookNextState.currentNotebook.notebook?.meta,
              blocksTime:
                notebookNextState.currentNotebook?.unsavedNotebook?.meta
                  ?.blocksTime
            }
          }
        : null)
    }

    return rety
  }, [notebookNextState.currentNotebook, documentId])

  useEffect(() => {
    // console.log('👛🎒👔 1. Document ID or Revision Updated', {
    //   documentId,
    //   revision
    // })
    if (!previousId) {
      // console.log('👛🎒👔 2. No previous Document ID or Revision')
      setPreviousIdRev(documentId, revision)
    } else if (previousId === documentId) {
      // console.log('👛🎒👔 3. Previous Document ID is current document id')
      if (previousRevision === revision) {
        // console.log('👛🎒👔 3.1 Previous Revision is current document revision')
      } else {
        // console.log(
        //   '👛🎒👔 3.2 Previous Revision is different from current document revision'
        // )

        if (notebook?.status?.error === NotebookError.RevisionUnavailable) {
          // console.log(
          //   '👛🎒👔 3.2.1 Notebook has error',
          //   notebook?.status?.error
          // )
          // const done = notebookNextActions.resetCurrent()
          // const tid = setTimeout(done, 5000)
          // return () => clearTimeout(tid)
        }
      }
    }
  }, [documentId, revision])

  const isNotebookReady =
    editorNotebook &&
    (!editorNotebook.status?.loading ||
      !notebookNextState.currentNotebook.resetting) &&
    !notebookNextState.currentNotebook.resetting

  const nsRef = useRef()
  const getFreshNotebookState = () => nsRef.current
  useEffect(() => {
    nsRef.current = notebookNextState
  }, [notebookNextState])
  useEffect(() => {
    notebookNextActions.setDocumentView(true)
    return () => {
      notebookNextActions.setDocumentView(false)
    }
  }, [])

  const onChangeNext = useCallback((editorDocument) => {
    const newBlocks = editorDocument?.blocks
    const newCompiled = editorDocument?.compiled
    const latest = getFreshNotebookState()
    const oldBlocks = latest?.currentNotebook?.notebook?.blocks
    const oldCompiled = latest?.currentNotebook?.notebook?.compiled
    const newHash = hash({ blocks: newBlocks, compiled: newCompiled })
    const oldHash = hash({ blocks: oldBlocks, compiled: oldCompiled })

    if (newHash !== oldHash) {
      notebookNextActions.onNotebookChange(
        newBlocks,
        {},
        newCompiled,
        editorDocument.time
      )
    }
  }, [])

  const history = useHistory()
  const location = useLocation()

  const [{ restricted, restrictedElm }] = useRestrictedFlow(
    documentId,
    revision ? +revision : revision
  )

  useEffect(() => {
    // console.log('restricted updated:', { restricted, restrictedActions })
    if (restricted) {
      notebookNextActions.setDocumentView(false)
    } else {
      notebookNextActions.setDocumentView(true)
    }
  }, [restricted])

  // Handle cases:
  // [√] New document
  // [√] User-owned document
  // [√] General manager access
  // [√] Shared (user -> public) document
  // [ ] Shared (user -> user) document
  // [√] Private document (no access - not public/published, unpublished)
  // [√] Non-existing document [same as New document]
  // [√] Non-existing revision

  // ! Fix handling new document transfer
  useEffect(() => {
    const notebookNextState = getFreshNotebookState()
    if (
      notebookNextState.currentNotebook.notebookId &&
      documentId !== notebookNextState.currentNotebook.notebookId
    ) {
      if (documentId !== 'new-document' && !location.state?.fork) {
        const done = notebookNextActions.resetCurrent()
        setTimeout(done, 200)
      }
      if (location.state?.fork) {
        // Avoid stale history state
        history.replace(location.pathname)
      }
    }
  }, [documentId, revision])

  useEffect(() => {
    if (
      documentId === notebookNextState.currentNotebook?.notebook?.notebookId &&
      revision &&
      revision !== notebookNextState.currentNotebook?.notebook?.meta?.revision
    ) {
      if (
        +revision < +notebookNextState.currentNotebook?.notebook?.meta?.revision
      )
        // Redirect to the document id if document has an ID (after saving new document)
        history.replace(
          '/d' +
            notebookNextState.currentNotebook.notebookId +
            ':' +
            notebookNextState.currentNotebook?.notebook?.meta?.revision
        )
    }
  }, [revision, notebookNextState.currentNotebook?.notebook?.meta?.revision])

  useEffect(() => {
    // load user profile
    const username = notebook?.meta?.createdBy
    if (username) {
      userActions.loadUserProfile(username)
    }
  }, [notebook?.meta?.createdBy])

  const userProfile =
    user.userProfiles[notebook?.meta?.createdBy || user.currentUsername]

  return (
    <>
      <DocumentLayout>
        <DocumentLayout.Header>
          {(!restricted ||
            [
              NotebookError.Unavailable,
              NotebookError.RevisionUnavailable,
              NotebookError.Restricted
            ].indexOf(restricted) === -1) &&
            editorNotebook &&
            userProfile && (
              <NotebookHeader
                notebookId={documentId}
                notebook={editorNotebook}
                userProfile={userProfile}
                user={user}
              />
            )}
        </DocumentLayout.Header>
        <DocumentLayout.Content>
          {!restricted && isNotebookReady && (
            <DocumentIFrame
              isHost
              isEditor
              notebook={editorNotebook}
              newDocumentBlocks={newDocumentBlocks}
              onChange={onChangeNext}
            />
          )}
          {!!restricted && restrictedElm}
          {/* <pre>{JSON.stringify(notebookNextState, 1, 1)}</pre> */}
        </DocumentLayout.Content>
      </DocumentLayout>
    </>
  )
}

export default PublishedDocument
