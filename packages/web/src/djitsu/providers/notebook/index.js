import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { useUser } from '../user'
import { useCurrentNotebook } from './current-notebook'
import { useStoreNotebooks } from './stored-notebook'

const NotebookProviderContext = createContext([])

export const NotebookProvider = (props) => {
  const [isDocumentView, setDocumentView] = useState()
  const [
    { notebooks },
    {
      getUserNotebooks,
      getNotebookId,
      getNotebookMeta,
      getNotebookByName,
      getNotebookByHostname,
      loadNotebook,
      saveNotebook,
      publishNotebook,
      deployNotebook,
      enableLinkSharing,
      likeNotebook,
      starNotebook,
      addNotebookTag,
      removeNotebookTag
    }
  ] = useStoreNotebooks()

  const [
    { currentNotebook },
    {
      setCurrentNotebookId,
      onNotebookChange,
      saveCurrent,
      saveFork,
      resetCurrent,
      clearTemp,
      forkCurrent,
      likeCurrent,
      starCurrent
    }
  ] = useCurrentNotebook(notebooks)

  const state = {
    notebooks,
    currentNotebook,
    isDocumentView
  }

  const actions = {
    setCurrentNotebookId,

    getNotebookId,
    getNotebookByName,
    getNotebookByHostname,
    loadNotebook,
    saveNotebook,
    saveCurrent,
    resetCurrent,
    saveFork,
    publishNotebook,
    deployNotebook,
    enableLinkSharing,
    getUserNotebooks,
    likeNotebook,
    starNotebook,
    forkCurrent,
    likeCurrent,
    starCurrent,
    getNotebookMeta,
    addNotebookTag,
    removeNotebookTag,

    clearTemp,

    onNotebookChange,
    setDocumentView
  }

  const contextValue = [state, actions]
  return (
    <NotebookProviderContext.Provider value={contextValue}>
      {props.children}
    </NotebookProviderContext.Provider>
  )
}

/**
 * Use notebook with ID and revision
 * @param {import('djitsu/schema/notebook').NotebookID} [notebookId]
 * @param {import('djitsu/schema/notebook').NotebookRevision} [notebookRevision]
 * @returns {[UseNotebookState, UseNotebookActions]}
 */
export const useNotebook = (notebookId, notebookRevision) => {
  const [state, actions] = useContext(NotebookProviderContext)
  const [user] = useUser()

  const idRef = useRef()
  const getFreshId = () => idRef.current
  useEffect(() => {
    idRef.current = notebookId
  }, [notebookId])
  const stateRef = useRef()
  const getFreshState = () => stateRef.current
  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    // console.group('🦄🕷🐳  Notebook Handle ID change')
    // console.log('🦄🕷🐳 1. useNotebook Updated NotebookID', {
    //   notebookId,
    //   notebookRevision
    // })
    if (notebookId && state?.currentNotebook?.notebookId !== notebookId) {
      // console.log(
      //   '🦄🕷🐳 2. UseNotebook Updated NotebookID or NotebookRevision',
      //   {
      //     stateId: state?.currentNotebook?.notebookId,
      //     stateRev: state?.currentNotebook?.notebook?.meta?.revision
      //   }
      // )
      if (state?.currentNotebook?.notebookId !== notebookId)
        actions?.setCurrentNotebookId(notebookId)

      actions?.loadNotebook(notebookId, notebookRevision)
    }

    // No change
    else {
      // console.log('🦄🕷🐳 3. All the same', {
      //   stateId: state?.currentNotebook?.notebookId,
      //   stateRev: state?.currentNotebook?.notebook?.meta?.revision
      // })
    }
    console.groupEnd()
  }, [notebookId])

  useEffect(() => {
    if (state?.currentNotebook?.notebookId && user?.currentUsername) {
      actions?.getNotebookMeta(
        user.currentUsername,
        state?.currentNotebook?.notebookId
      )
    }
  }, [state?.currentNotebook?.notebookId, user?.currentUsername])
  //
  // Handle revision changes
  //
  useEffect(() => {
    // console.group('🦋🦚🐁  Notebook Handle Revision change')
    const stateRevision = state?.currentNotebook?.notebook?.meta?.revision
    // console.log('🦋🦚🐁 1. Revision', { stateRevision, notebookRevision })
    // console.log('🦋🦚🐁 1.1. State.currentNotebook', state.currentNotebook)

    // Both has revisions
    if (stateRevision && notebookRevision) {
      // console.log('🦋🦚🐁 2.1. State revision and notebook revisions exist')
      if (stateRevision !== notebookRevision) {
        // console.log(
        //   '🦋🦚🐁 2.1.1. State revision differs from notebook revision — load notebook!'
        // )

        const done = actions.resetCurrent()
        const fn = async () => {
          await actions?.loadNotebook(notebookId, notebookRevision)
          done()
        }

        fn()
      }
    }
    // No state revision
    else if (!stateRevision) {
      // console.log('🦋🦚🐁 2.2. No state revision but has notebook revision')
      if (!state.currentNotebook.notebookId?.status?.loaded) {
        // console.log('🦋🦚🐁 2.2.1. Notebook not loaded - load notebook!')
        actions?.loadNotebook(notebookId, notebookRevision)
      }
    }
    // No notebook revision
    else {
      // console.log(
      //   '🦋🦚🐁 2.3. Has state revision but no notebook revision - load notebook!'
      // )
      actions?.loadNotebook(notebookId, notebookRevision)
    }

    console.groupEnd()
  }, [notebookRevision])

  /** @type {onNotebookChangeCurrent} */
  const onNotebookChange = useCallback((blocks, properties, compiled, time) => {
    const notebookId =
      getFreshId() || getFreshState().currentNotebook.notebookId

    return actions.onNotebookChange(
      notebookId,
      blocks,
      properties,
      compiled,
      time
    )
  }, [])
  return [state, { ...actions, onNotebookChange }]
}

export default NotebookProvider

/**
 * @typedef {Object} UseNotebookState
 * @property {{ [NotebookID]: Partial<Notebook>}} notebooks
 *  store notebooks
 * @property {import('./current-notebook').CurrentNotebook} currentNotebook
 *  currently active notebook
 * @property {boolean} isDocumentView
 */

/**
 * @typedef {Object} UseNotebookActions
 * @property {import('./stored-notebook').getUserNotebooks} getUserNotebooks
 *   ```js
 *      const username = 'elis'
 *
 *      const notebooks = await getUserNotebooks(username)
 *    ```
 * @property {import('./stored-notebook').getNotebookID} getNotebookId
 *   ```js
 *      const notebookName = 'my-notebook'
 *      const username = 'elis'
 *
 *      const notebookId = await getNotebookId(notebookName, username)
 *    ```
 * @property {import('./stored-notebook').getNotebookByName} getNotebookByName
 *   ```js
 *      const notebookName = 'my-notebook'
 *      const username = 'elis'
 *      const version = '1.34.7'
 *
 *      const notebook = await getNotebookByName(notebookName, username, version)
 *    ```
 * @property {import('./stored-notebook').getNotebookByHostname} getNotebookByHostname
 *   ```js
 *      const hostname = 'test1'
 *
 *      const notebook = await getNotebookByHostname(hostname)
 *    ```
 * @property {import('./stored-notebook').loadNotebook} loadNotebook
 *   ```js
 *      const notebook = await loadNotebook(notebookId, notebookRevision)
 *    ```
 * @property {import('./stored-notebook').saveNotebook} saveNotebook
 *   ```js
 *      const nextRevision = await saveNotebook(notebookId, notebook)
 *    ```
 * @property {import('./stored-notebook').publishNotebook} publishNotebook
 *   ```js
 *      const publishedVersion = await publishNotebook(notebookId, version, title, name)
 *    ```
 * @property {import('./stored-notebook').deployNotebook} deployNotebook
 *   ```js
 *      const publishedVersion = await publishNotebook(notebookId, hostname)
 *    ```
 * @property {import('./stored-notebook').enableLinkSharing} enableLinkSharing
 *   ```js
 *      const publishedVersion = await publishNotebook(notebookId, enable)
 *    ```
 *
 * @property {import('./current-notebook').resetCurrent} resetCurrent
 *   ```js
 *      await resetCurrent()
 *    ```
 * @property {import('./current-notebook').saveCurrent} saveCurrent
 *   ```js
 *      const nextId = await saveCurrent()
 *    ```
 * @property {import('./current-notebook').setCurrentNotebookID} setCurrentNotebookId
 *   ```js
 *      setCurrentNotebookId(notebookId)
 *    ```
 * @property {import('./current-notebook').saveFork} saveFork
 *   ```js
 *      const nextNotebookId = await saveFork()
 *    ```
 *
 * @property {import('./temp-notebook').clearTemp} clearTemp
 *   ```js
 *      clearTemp()
 *    ```
 *
 * @property {onNotebookChangeCurrent} onNotebookChange
 *   ```js
 *      const await onNotebookChangeCurrent()
 *    ```
 *
 * @property {setDocumentView} setDocumentView
 *   ```js
 *      const await onNotebookChangeCurrent()
 *    ```
 *
 *
 * @property {likeCurrent} likeCurrent
 *   ```js
 *      const await likeCurrent()
 *    ```
 *
 *
 * @property {starCurrent} starCurrent
 *   ```js
 *      const await starCurrent()
 *    ```
 *
 *
 * @property {likeNotebook} likeNotebook
 *   ```js
 *      const await likeNotebook(notebookId)
 *    ```
 *
 *
 * @property {starNotebook} starNotebook
 *   ```js
 *      const await starNotebook(notebookId)
 *    ```
 *
 *
 *
 * @property {getNotebookMeta} getNotebookMeta
 *   ```js
 *      const await getNotebookMeta(username, notebookId)
 *    ```
 *
 */

/**
 * @typedef {import('djitsu/schema/notebook').Notebook} Notebook
 * @typedef {import('djitsu/schema/notebook').NotebookID} NotebookID
 * @typedef {import('djitsu/schema/notebook').NotebookName} NotebookName
 * @typedef {import('djitsu/schema/notebook').NotebookVersion} NotebookVersion
 * @typedef {import('djitsu/schema/notebook').NotebookRevision} NotebookRevision
 * @typedef {import('djitsu/schema/notebook').NotebookProperties} NotebookProperties
 * @typedef {import('djitsu/schema/notebook').CompiledNotebook} CompiledNotebook
 * @typedef {import('djitsu/schema/user').Username} Username
 * @typedef {import('djitsu/schema/generics').Timestamp} Timestamp
 */

/**
 * @callback onNotebookChangeCurrent
 * @param {Block[]} blocks
 * @param {NotebookProperties} properties
 * @param {CompiledNotebook} compiled
 * @param {Timestamp} time
 */

/**
 * @callback setDocumentView
 * @param {boolean | (currentValue) => boolean} isDocumentView
 */
