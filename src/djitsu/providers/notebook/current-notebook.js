import useStates from 'djitsu/utils/hooks/use-states'
import { useCallback, useEffect, useRef } from 'react'
import { useTempNotebook } from './temp-notebook'
import hash from 'object-hash'
import { useStoreNotebooks } from './stored-notebook'
import { useUser } from '../user'

/**
 *
 * @param {{ [NotebookID]: Partial<Notebook> }} notebooks
 * @returns {[CurrentNotebookState, CurrentNotebookActions]}
 */
export const useCurrentNotebook = (notebooks) => {
  const [user] = useUser()

  const [
    ,
    {
      loadNotebook,
      saveNotebook,
      newNotebook,
      forkNotebook,
      likeNotebook,
      starNotebook
    }
  ] = useStoreNotebooks()
  const [{ tempNotebook }, { onNotebookChange, clearTemp }] = useTempNotebook()

  const [currentNotebook, setCurrentNotebook] = useStates({})

  const userRef = useRef()
  const getFreshUser = () => userRef.current
  useEffect(() => {
    userRef.current = user
  }, [user])

  const tempRef = useRef()
  const getFreshTemp = () => tempRef.current
  useEffect(() => {
    tempRef.current = tempNotebook
  }, [tempNotebook])

  const currentRef = useRef()
  const getFreshCurrent = () => currentRef.current
  useEffect(() => {
    currentRef.current = currentNotebook
  }, [currentNotebook])

  /** @type {setCurrentNotebookID} */
  const setCurrentNotebookId = useCallback((notebookId) => {
    setCurrentNotebook('notebookId', notebookId)
    const currentNotebook = getFreshCurrent()
    if (
      currentNotebook?.notebook &&
      currentNotebook.notebook.notebookId !== notebookId
    ) {
      setCurrentNotebook('notebook', null)
    }
    return true
  }, [])

  /** @type {forkCurrent} */
  const forkCurrent = useCallback(async (forkPublic) => {
    const currentNotebook = getFreshCurrent()
    const user = getFreshUser()
    const result = await forkNotebook(
      user.currentUsername,
      currentNotebook.notebookId,
      forkPublic
    )
    return result
  }, [])

  /** @type {likeCurrent} */
  const likeCurrent = useCallback(async (isLike = true) => {
    const currentNotebook = getFreshCurrent()
    const user = getFreshUser()
    const result = await likeNotebook(
      user.currentUsername,
      currentNotebook.notebookId,
      isLike
    )
    return result
  }, [])

  /** @type {starCurrent} */
  const starCurrent = useCallback(async (isStar = true) => {
    const currentNotebook = getFreshCurrent()
    const user = getFreshUser()
    const result = await starNotebook(
      user.currentUsername,
      currentNotebook.notebookId,
      isStar
    )
    return result
  }, [])

  /** @type {saveCurrent} */
  const saveCurrent = useCallback(async () => {
    const tempNotebook = getFreshTemp()
    const currentNotebook = getFreshCurrent()
    const user = getFreshUser()

    const { status, ...notebook } = currentNotebook.notebook || {}
    const saveData = {
      ...(notebook || {}),
      ...(tempNotebook?.blocks ? { blocks: tempNotebook.blocks } : {}),
      ...(tempNotebook?.compiled
        ? {
            compiled: {
              ...(tempNotebook.compiled?.generatedCode
                ? {
                    code: tempNotebook.compiled.generatedCode,
                    size: tempNotebook.compiled.generatedCode.length
                  }
                : {}),
              ...(tempNotebook.compiled?.imports
                ? { imports: tempNotebook.compiled.imports }
                : {}),
              ...(tempNotebook.compiled?.exports
                ? { exports: tempNotebook.compiled?.exports }
                : {})
            }
          }
        : {}),
      ...(tempNotebook?.time
        ? {
            meta: {
              ...(currentNotebook.notebook?.meta || {}),
              blocksTime: tempNotebook?.time,
              blocksCount: tempNotebook.blocks?.length
            }
          }
        : {})
    }

    let isNewlyCreated

    let notebookId = currentNotebook.notebookId
    if (notebookId === 'new-document') {
      notebookId = await newNotebook(user.currentUsername)
      setCurrentNotebook('notebookId', () => notebookId)
      isNewlyCreated = true
    }

    if (
      (!status || status.error === 'notebook-unavailable') &&
      !isNewlyCreated
    ) {
      await newNotebook(user.currentUsername, notebookId)
    }

    const saveResult = await saveNotebook(notebookId, saveData)
    const nextNotebook = {
      ...saveData,
      meta: {
        ...(saveData?.meta || {}),
        revision: saveResult,
        updated: Date.now()
      }
    }

    setCurrentNotebook('notebook', nextNotebook)
    clearTemp()
    loadNotebook(notebookId)

    return notebookId
  }, [
    currentNotebook.notebookId,
    currentNotebook.notebook,
    tempNotebook,
    currentNotebook.unsavedNotebook
  ])

  /** @type {resetCurrent} */
  const resetCurrent = useCallback(() => {
    clearTemp()
    setCurrentNotebook('resetting', true)
    return () => {
      setCurrentNotebook('resetting', false)
    }
  }, [])

  /** @type {saveFork} */
  const saveFork = useCallback(
    async (isPublic) => {
      const { status, ...notebook } = currentNotebook.notebook || {}
      const user = getFreshUser()
      const tempNotebook = getFreshTemp()
      const saveData = {
        ...(notebook || {}),
        ...(tempNotebook?.blocks ? { blocks: tempNotebook.blocks } : {}),
        ...(tempNotebook?.compiled
          ? {
              compiled: {
                ...(tempNotebook.compiled?.generatedCode
                  ? {
                      code: tempNotebook.compiled.generatedCode,
                      size: tempNotebook.compiled.generatedCode.length
                    }
                  : {}),
                ...(tempNotebook.compiled?.imports
                  ? { imports: tempNotebook.compiled.imports }
                  : {}),
                ...(tempNotebook.compiled?.exports
                  ? { exports: tempNotebook.compiled?.exports }
                  : {})
              }
            }
          : {}),
        meta: {
          ...(currentNotebook.notebook?.meta || {}),
          blocksTime: tempNotebook?.time,
          blocksCount: tempNotebook?.blocks?.length,
          ...(isPublic
            ? {
                forkOf: `${notebook.meta.createdBy}:${notebook.meta.name}`,
                forkVersion: notebook.meta.version
              }
            : {
                forkOf: currentNotebook.notebookId,
                forkRevision: notebook.meta?.revision
              })
        }
      }

      const notebookId = await newNotebook(user.currentUsername)

      await saveNotebook(notebookId, saveData)
      clearTemp()

      return notebookId
    },
    [currentNotebook.notebookId, currentNotebook.notebook, tempNotebook, user]
  )

  useEffect(() => {
    if (currentNotebook.notebookId) {
      const notebook = notebooks[currentNotebook.notebookId]
      setCurrentNotebook('notebook', () => notebook)
    }
  }, [currentNotebook.notebookId, notebooks])

  useEffect(() => {
    if (
      currentNotebook.notebookId &&
      currentNotebook.notebook &&
      currentNotebook.notebookId !== tempNotebook?.notebookId &&
      tempNotebook?.notebookId !== 'new-document'
    ) {
      // console.log(
      //   '🧯🧯🧯🧯🧯🧯🧯🧯🧯🧯🧯 CLEARING TEMP',
      //   [currentNotebook.notebookId, tempNotebook?.notebookId],
      //   currentNotebook
      // )
      clearTemp()
      setCurrentNotebook('unsavedNotebook', () => undefined)
    } else if (
      tempNotebook &&
      tempNotebook?.notebookId !== 'new-document' &&
      currentNotebook.notebookId === tempNotebook.notebookId
    ) {
      onNotebookChange(
        currentNotebook.notebookId,
        tempNotebook.blocks,
        tempNotebook.properties,
        tempNotebook.compiled,
        tempNotebook.time
      )
    }
  }, [currentNotebook.notebookId])

  useEffect(() => {
    // console.log('📗 TEMP NOTEBOOK UPDATED', { tempNotebook, currentNotebook })
    if (
      tempNotebook &&
      tempNotebook.blocks?.length &&
      currentNotebook.notebookId &&
      tempNotebook.notebookId === currentNotebook.notebookId
    ) {
      // console.log('𝟙 📗 COMPILING?')
      const currentHash = hash({ blocks: currentNotebook.notebook?.blocks })
      const nextHash = hash({ blocks: tempNotebook?.blocks })
      if (currentHash !== nextHash) {
        // console.log('𝟙.𝟏 📗 COMPILING...')
        const unsaved = {
          notebookId: tempNotebook.notebookId,
          ...currentNotebook.notebook,
          blocks: tempNotebook.blocks,
          compiled: tempNotebook.compiled,
          meta: {
            ...(currentNotebook.notebook?.meta || {}),
            blocksTime: tempNotebook.time,
            blocksCount: tempNotebook.blocks?.length
          },
          status: {
            ...(currentNotebook.notebook?.status || {}),
            unsaved: true
          }
        }
        // console.log('𝟙.𝟏.① 📗 SETTING UNSAVED...', unsaved)

        setCurrentNotebook('unsavedNotebook', unsaved)
      } else {
        // console.log('𝟙.2 📗 CLEARING...')
        clearTemp()
        setCurrentNotebook('unsavedNotebook', () => undefined)
      }
    } else if (!tempNotebook) {
      // console.log('𝟚 📗 CLEARING...')
      setCurrentNotebook('unsavedNotebook', () => undefined)
    }
  }, [tempNotebook])

  return [
    { currentNotebook },
    {
      onNotebookChange,
      setCurrentNotebookId,
      saveCurrent,
      resetCurrent,
      saveFork,
      clearTemp,
      forkCurrent,
      likeCurrent,
      starCurrent
    }
  ]
}

/**
 * @typedef {import('djitsu/schema/notebook').Notebook} Notebook
 * @typedef {import('djitsu/schema/notebook').NotebookID} NotebookID
 * @typedef {import('djitsu/schema/notebook').NotebookName} NotebookName
 * @typedef {import('djitsu/schema/notebook').NotebookVersion} NotebookVersion
 * @typedef {import('djitsu/schema/notebook').NotebookRevision} NotebookRevision
 * @typedef {import('djitsu/schema/user').Username} Username
 */

/**
 * @callback setCurrentNotebookID
 * @param {NotebookID} notebookId
 * @return {true}
 */

/**
 * @typedef {Object} CurrentNotebookState
 * @property {CurrentNotebook} currentNotebook
 */

/**
 * @typedef {Object} CurrentNotebookActions
 * @property {import('./temp-notebook').onNotebookChange} onNotebookChange
 * @property {setCurrentNotebookID} setCurrentNotebookId
 * @property {saveCurrent} saveCurrent
 * @property {resetCurrent} resetCurrent
 * @property {saveFork} saveFork
 * @property {forkCurrent} forkCurrent
 * @property {likeCurrent} likeCurrent
 * @property {starCurrent} starCurrent
 * @property {import('./temp-notebook').clearTemp} clearTemp
 */

/**
 * @typedef {Object} CurrentNotebook
 * @property {NotebookID} notebookId
 * @property {Partial<Notebook>} notebook
 * @property {Partial<Notebook>} unsavedNotebook
 * @property {boolean} resetting
 */

/**
 * @callback saveCurrent
 * @return {Promise<NotebookID>}
 */

/**
 * @callback resetCurrent
 * @return {() => void}
 */

/**
 * @callback saveFork
 * @return {Promise<NotebookID>}
 */

/**
 * @callback forkCurrent
 * @param {boolean} forkPublic
 * @return {Promise<number>}
 */

/**
 * @callback likeCurrent
 * @param {boolean} isLike
 * @return {Promise<boolean>}
 */

/**
 * @callback starCurrent
 * @param {boolean} isStar
 * @return {Promise<boolean>}
 */
