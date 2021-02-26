import {
  getNotebookId as getNotebookIdStore,
  getNotebookByName as getNotebookByNameStore,
  getNotebookByHostname as getNotebookByHostnameStore,
  getNotebook
} from 'djitsu/store/notebook/thunks/get-notebook'
import { useDispatcher, useSelector } from 'djitsu/store'
import { useCallback } from 'react'
import { saveNotebookRevision } from 'djitsu/store/notebook/thunks/save-notebook-revision'
import { newNotebook as newNotebookStore } from 'djitsu/store/notebook/thunks/new-notebook'
import { enableLinkSharing as enableLinkSharingStore } from 'djitsu/store/notebook/thunks/share-notebook'
import { publishNotebook as publishNotebookStore } from 'djitsu/store/notebook/thunks/publish-notebook'
import { deployNotebook as deployNotebookStore } from 'djitsu/store/notebook/thunks/deploy-notebook'
import { getUserNotebooks as getUserNotebooksStore } from 'djitsu/store/notebook/thunks/get-notebooks'
import {
  getNotebookUserMeta,
  forkNotebook as forkNotebookStore,
  likeNotebook as likeNotebookStore,
  starNotebook as starNotebookStore
} from 'djitsu/store/notebook/thunks/meta-notebook'
import {
  addNotebookTag as addNotebookTagStore,
  removeNotebookTag as removeremoveNotebookTagStore
} from 'djitsu/store/notebook/thunks/tag-notebook'

// likeNotebook
// : likeNotebookStore,
// starNotebook
// : starNotebookStore
/**
 * @return {[StoreNotebooksState, StoreNotebooksActions]}
 */
export const useStoreNotebooks = () => {
  const store = useDispatcher({
    getNotebook,
    getNotebookByName: getNotebookByNameStore,
    getNotebookByHostname: getNotebookByHostnameStore,
    saveNotebookRevision,
    newNotebook: newNotebookStore,
    enableLinkSharing: enableLinkSharingStore,
    getNotebookId: getNotebookIdStore,
    publishNotebook: publishNotebookStore,
    deployNotebook: deployNotebookStore,
    getUserNotebooks: getUserNotebooksStore,
    likeNotebook: likeNotebookStore,
    starNotebook: starNotebookStore,
    forkNotebook: forkNotebookStore,
    addNotebookTag: addNotebookTagStore,
    removeNotebookTag: removeremoveNotebookTagStore,
    getNotebookUserMeta
  })
  const notebooks = useSelector(({ notebook }) => notebook.notebooks)

  /** @type {getUserNotebooks} */
  const getUserNotebooks = useCallback(async (username, query) => {
    try {
      const result = await store.getUserNotebooks(username, query)
      return result
    } catch (error) {
      console.log('CANT LOAD NOTEBOOKS:', error)
    }
    return {}
  }, [])

  /** @type {loadNotebook} */
  const loadNotebook = useCallback(async (notebookId, notebookRevision) => {
    try {
      const result = await store.getNotebook(notebookId, notebookRevision)
      return result
    } catch (error) {
      // console.log('CANT LOAD NOTEBOOK:', error)
    }
    return {}
  }, [])

  /** @type {saveNotebook} */
  const saveNotebook = useCallback(async (notebookId, notebook) => {
    const result = await store.saveNotebookRevision(notebookId, notebook)
    return result
  }, [])

  /** @type {newNotebook} */
  const newNotebook = useCallback(
    (username, notebookId) => store.newNotebook(username, notebookId),
    []
  )

  /** @type {enableLinkSharing} */
  const enableLinkSharing = useCallback((notebookId, enable) => {
    return store.enableLinkSharing(notebookId, enable)
  }, [])

  /** @type {getNotebookByName} */
  const getNotebookByName = useCallback(
    (notebookName, username, version) =>
      store.getNotebookByName(notebookName, username, version),
    []
  )

  /** @type {getNotebookByHostname} */
  const getNotebookByHostname = useCallback(
    (hostname) => store.getNotebookByHostname(hostname),
    []
  )

  /** @type {getNotebookID} */
  const getNotebookId = useCallback(
    (notebookName, username) => store.getNotebookId(notebookName, username),
    []
  )

  /** @type {publishNotebook} */
  const publishNotebook = useCallback(
    (notebookId, version, title, name) =>
      store.publishNotebook(notebookId, version, title, name),
    []
  )

  /** @type {deployNotebook} */
  const deployNotebook = useCallback(
    (notebookId, hostname) => store.deployNotebook(notebookId, hostname),
    []
  )

  /** @type {forkNotebook} */
  const forkNotebook = useCallback(
    (username, notebookId) => store.forkNotebook(username, notebookId),
    []
  )

  /** @type {likeNotebook} */
  const likeNotebook = useCallback(
    (username, notebookId, isLike = true) =>
      store.likeNotebook(username, notebookId, isLike),
    []
  )

  /** @type {starNotebook} */
  const starNotebook = useCallback(
    (username, notebookId, isStar = true) =>
      store.starNotebook(username, notebookId, isStar),
    []
  )

  /** @type {getNotebookMeta} */
  const getNotebookMeta = useCallback(
    (username, notebookId, meta) =>
      store.getNotebookUserMeta(username, notebookId, meta),
    []
  )

  /** @type {addNotebookTag} */
  const addNotebookTag = useCallback(
    (notebookId, tag) => store.addNotebookTag(notebookId, tag),
    []
  )

  /** @type {removeNotebookTag} */
  const removeNotebookTag = useCallback(
    (notebookId, tag) => store.removeNotebookTag(notebookId, tag),
    []
  )

  /** @type {StoreNotebooksState} */
  const state = { notebooks }

  /** @type {StoreNotebooksActions} */
  const actions = {
    getUserNotebooks,
    getNotebookId,
    getNotebookByName,
    getNotebookByHostname,
    getNotebookMeta,
    loadNotebook,
    saveNotebook,
    newNotebook,
    publishNotebook,
    deployNotebook,
    enableLinkSharing,
    forkNotebook,
    likeNotebook,
    starNotebook,
    addNotebookTag,
    removeNotebookTag
  }

  return [state, actions]
}

/**
 * @typedef {import('djitsu/schema/notebook').Notebook} Notebook
 * @typedef {import('djitsu/schema/notebook').NotebookID} NotebookID
 * @typedef {import('djitsu/schema/notebook').NotebookName} NotebookName
 * @typedef {import('djitsu/schema/notebook').NotebookHostname} NotebookHostname
 * @typedef {import('djitsu/schema/notebook').NotebookVersion} NotebookVersion
 * @typedef {import('djitsu/schema/notebook').NotebookRevision} NotebookRevision
 * @typedef {import('djitsu/schema/user').Username} Username
 */

/**
 * @typedef StoreNotebooksState
 * @property {{ [NotebookID]: Partial<Notebook> }} notebooks
 */

/**
 * @typedef StoreNotebooksActions
 * @property {getUserNotebooks} getUserNotebooks
 * @property {getNotebookID} getNotebookID
 * @property {getNotebookByName} getNotebookByName
 * @property {getNotebookByHostname} getNotebookByHostname
 * @property {loadNotebook} loadNotebook
 * @property {saveNotebook} saveNotebook
 * @property {newNotebook} newNotebook
 * @property {publishNotebook} publishNotebook
 * @property {deployNotebook} deployNotebook
 * @property {enableLinkSharing} enableLinkSharing
 * @property {forkNotebook} forkNotebook
 * @property {likeNotebook} likeNotebook
 * @property {starNotebook} starNotebook
 * @property {getNotebookMeta} getNotebookMeta
 */

/**
 * @callback getUserNotebooks
 * @param {Username} username
 * @param {query} unknown
 * @return {Promise<Partial<Notebook>[]>}
 */

/**
 * @callback getNotebookByName
 * @param {NotebookName} notebookName
 * @param {Username} username
 * @param {NotebookVersion} [version]
 * @return {Promise<Partial<Notebook>>}
 */

/**
 * @callback getNotebookByHostname
 * @param {NotebookHostname} notebookHostname
 * @return {Promise<Partial<Notebook>>}
 */

/**
 * @callback getNotebookID
 * @param {NotebookName} notebookName
 * @param {Username} username
 * @return {Promise<NotebookID>}
 */

/**
 * @callback loadNotebook
 * @param {NotebookID} notebookId
 * @param {NotebookRevision} [notebookRevision]
 * @return {Promise<Partial<Notebook>>}
 */

/**
 * @callback saveNotebook
 * @param {NotebookID} notebookId
 * @param {Notebook} notebook
 * @return {Promise<NotebookRevision>}
 */

/**
 * @callback newNotebook
 * @param {Username} username
 * @param {NotebookID} [notebookId]
 * @return {Promise<NotebookID>}
 */

/**
 * @callback publishNotebook
 * @param {NotebookID} notebookId
 * @param {NotebookVersion} version
 * @param {string} title
 * @param {NotebookName} name
 * @return {Promise<NotebookVersion>}
 */

/**
 * @callback deployNotebook
 * @param {NotebookID} notebookId
 * @param {NotebookHostname} hostname
 * @return {Promise<true>}
 */

/**
 * @callback enableLinkSharing
 * @param {NotebookID} notebookId
 * @param {boolean} enable
 * @return {Promise<boolean>}
 */

/**
 * @callback forkNotebook
 * @param {Username} username
 * @param {NotebookID} notebookId
 * @return {Promise<number>}
 */

/**
 * @callback likeNotebook
 * @param {Username} username
 * @param {NotebookID} notebookId
 * @param {boolean} isLike
 * @return {Promise<boolean>}
 */

/**
 * @callback starNotebook
 * @param {Username} username
 * @param {NotebookID} notebookId
 * @param {boolean} isStar
 * @return {Promise<boolean>}
 */

/**
 * @callback getNotebookMeta
 * @param {Username} username
 * @param {NotebookID} notebookId
 * @param {NotebookMetaAction} meta
 * @return {Promise<Record<NotebookMetaAction, Partial<NotebookMetaData>>>}
 */
