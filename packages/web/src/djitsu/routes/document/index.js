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
import { logEvent } from 'djitsu/services/telemetry'

import Helmet from 'react-helmet'

const newDocumentBlocks = [
  {
    type: 'header',
    data: {
      text: 'Click Here To Give Your Notebook a Name',
      level: 1
    }
  },
  {
    type: 'paragraph',
    data: {
      text:
        'Talk about your notebook here. You can add Heading and paragraphs to build docs, or a blog post. Make it look excellent!!'
    }
  },
  {
    type: 'dcode',
    data: {
      data: {
        code: {
          options: { language: 'js' },
          code:
            "//////////////////////////\n//\n// Write your code here!!\n//\n// \n\nimport React from 'react'\n\nimport styled from 'styled-components'\n\nexport const Main = () => {\n  return (\n    <Wrap>\n      <h1>Welcome to Djit.su</h1>\n      <h3>this</h3>\n      <h2>is</h2>\n      <h1>awesome!</h1>\n    </Wrap>\n  )\n}\n\nconst Wrap = styled.div`\nbackground: #4285f4;\ndisplay: flex;\nalign-items: center;\nflex-direction: column;\npadding: 15px;\n\nh1 {\n  font-size: 2rem;\n  color: #f1f6ff !important;\n}\n\nh2, h3 {\n  color: #a8c6f9 !important;\n}\n\nh2 {\n  font-size: 1.5rem;\n}\n`\n"
        },
        demo: '<Main />',
        preview: ''
      },
      tool: { options: {}, viewOptions: {} },
      tune: {}
    }
  }
]

export const Document = (props) => {
  const { documentId = 'new-document', revision } = props.match.params || {}
  const [user, userActions] = useUser()
  const [[previousId, previousRevision], _setPreviousIdRev] = useState([])
  const setPreviousIdRev = (...idrev) => _setPreviousIdRev(idrev)

  const [state, notebookActions] = useNotebook(
    documentId,
    revision ? +revision : revision
  )

  useEffect(() => {
    logEvent('init-notebook', {
      documentId,
      revision
    })
    return () => {
      notebookActions.setCurrentNotebookId('')
      logEvent('close-notebook', {
        documentId,
        revision
      })
    }
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
  }, [state.currentNotebook, documentId])

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
          // const done = notebookActions.resetCurrent()
          // const tid = setTimeout(done, 5000)
          // return () => clearTimeout(tid)
        }
      }
    }
  }, [documentId, revision])

  const isNotebookReady =
    editorNotebook &&
    (!editorNotebook.status?.loading || !state.currentNotebook.resetting) &&
    !state.currentNotebook.resetting

  const nsRef = useRef()
  const getFreshNotebookState = () => nsRef.current
  useEffect(() => {
    nsRef.current = state
  }, [state])
  useEffect(() => {
    notebookActions.setDocumentView(true)
    return () => {
      notebookActions.setDocumentView(false)
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
      logEvent('notebook-changed', {
        documentId,
        revision,
        blocksLength: newBlocks.length
      })
      notebookActions.onNotebookChange(
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
      notebookActions.setDocumentView(false)
    } else {
      notebookActions.setDocumentView(true)
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
    const state = getFreshNotebookState()
    if (
      state.currentNotebook.notebookId &&
      documentId !== state.currentNotebook.notebookId
    ) {
      if (documentId !== 'new-document' && !location.state?.fork) {
        const done = notebookActions.resetCurrent()
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
      documentId === state.currentNotebook?.notebook?.notebookId &&
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
      logEvent('username-notebook-loaded', {
        username,
        documentId,
        revision
      })
    }
  }, [notebook?.meta?.createdBy])

  const userProfile =
    user.userProfiles[notebook?.meta?.createdBy || user.currentUsername]

  const isNotebook = async (username, notebookName, version) => {
    try {
      await notebookActions.getNotebookId(notebookName, username, version)
      return true
    } catch (error) {
      return false
    }
  }
  const getNotebook = (username, notebookName, version) =>
    notebookActions.getNotebookByName(notebookName, username, version)

  return (
    <>
      <DocumentLayout>
        <Helmet
          titleTemplate={`%s - a djit.su notebook${
            editorNotebook?.meta?.createdBy
              ? ' by ' + editorNotebook?.meta?.createdBy
              : ''
          }`}
        >
          {/* {editorNotebook?.properties?.previewPhotoUrl &&
            typeof editorNotebook?.properties?.previewPhotoUrl === 'string' && (
              <meta
                property='og:preview'
                content={`${editorNotebook?.properties?.previewPhotoUrl}`}
              ></meta>
            )} */}
        </Helmet>
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
              isNotebook={isNotebook}
              getNotebook={getNotebook}
            />
          )}
          {!!restricted && restrictedElm}
          {/* <pre>{JSON.stringify(editorNotebook, 1, 1)}</pre> */}
        </DocumentLayout.Content>
      </DocumentLayout>
    </>
  )
}

export default Document
