import * as types from './types'
import {
  Notebook,
  NotebookHostname,
  NotebookID,
  NotebookMetaAction,
  NotebookMetaData,
  NotebookName,
  NotebookRevision,
  NotebooksQuery,
  NotebookTag,
  NotebookVersion
} from 'djitsu/schema/notebook'
import { Username } from 'djitsu/schema/user'

export const loadingUserNotebooks = (
  username: Username,
  query?: NotebooksQuery
): types.LoadingUserNotebooks => ({
  type: types.NOTEBOOK_LOADING_USER_NOTEBOOKS,
  payload: {
    username,
    query
  }
})

export const loadedUserNotebooks = (
  notebooks: Partial<Notebook>[],
  username: Username,
  query?: NotebooksQuery
): types.LoadedUserNotebooks => ({
  type: types.NOTEBOOK_LOADED_USER_NOTEBOOKS,
  payload: {
    notebooks,
    username,
    query
  }
})

export const loadFailedUserNotebooks = (
  error: Error | unknown,
  username: Username,
  query?: NotebooksQuery
): types.LoadFailedUserNotebooks => ({
  type: types.NOTEBOOK_LOAD_FAILED_USER_NOTEBOOKS,
  payload: {
    error,
    username,
    query
  }
})

export const loadingNotebookUserMeta = (
  username: Username,
  notebookId: NotebookID,
  meta?: NotebookMetaAction
): types.LoadingNotebookUserMeta => ({
  type: types.NOTEBOOK_LOADING_USER_META,
  payload: {
    notebookId,
    username,
    meta
  }
})

export const loadedNotebookUserMeta = (
  result: Partial<Record<NotebookMetaAction, Partial<NotebookMetaData>>>,
  username: Username,
  notebookId: NotebookID,
  meta?: NotebookMetaAction
): types.LoadedNotebookUserMeta => ({
  type: types.NOTEBOOK_LOADED_USER_META,
  payload: {
    result,
    notebookId,
    username,
    meta
  }
})

export const loadFailedNotebookUserMeta = (
  error: Error | unknown,
  username: Username,
  notebookId: NotebookID,
  meta?: NotebookMetaAction
): types.LoadFailedNotebookUserMeta => ({
  type: types.NOTEBOOK_LOAD_FAILED_USER_META,
  payload: {
    error,
    notebookId,
    username,
    meta
  }
})

export const savingNotebookRevision = (
  notebookId: NotebookID,
  notebook: Partial<Notebook>
): types.SavingNotebookRevision => ({
  type: types.NOTEBOOK_SAVING_REVISION,
  payload: {
    notebookId,
    notebook
  }
})

export const savedNotebookRevision = (
  notebookId: NotebookID,
  notebook: Partial<Notebook>,
  notebookRevision: NotebookRevision
): types.SavedNotebookRevision => ({
  type: types.NOTEBOOK_SAVED_REVISION,
  payload: {
    notebookId,
    notebook,
    notebookRevision
  }
})

export const saveFailedNotebookRevision = (
  notebookId: NotebookID,
  error: Error | unknown
): types.SaveFailedNotebookRevision => ({
  type: types.NOTEBOOK_SAVE_FAILED_REVISION,
  payload: {
    notebookId,
    error
  }
})

export const loadingNotebook = (
  notebookId: NotebookID,
  revision?: NotebookRevision
): types.LoadingNotebookRevision => ({
  type: types.NOTEBOOK_LOADING_REVISION,
  payload: {
    notebookId,
    revision
  }
})

export const loadedNotebook = (
  notebookId: NotebookID,
  notebook: Partial<Notebook>,
  revision?: NotebookRevision
): types.LoadedNotebookRevision => ({
  type: types.NOTEBOOK_LOADED_REVISION,
  payload: {
    notebookId,
    revision,
    notebook
  }
})

export const loadFailedNotebook = (
  notebookId: NotebookID,
  error: Error | unknown,
  revision?: NotebookRevision
): types.LoadFailedNotebookRevision => ({
  type: types.NOTEBOOK_LOAD_FAILED_REVISION,
  payload: {
    notebookId,
    revision,
    error
  }
})

export const loadingNotebookByName = (
  name: NotebookName,
  username: Username,
  version?: NotebookVersion
): types.LoadingNotebookByName => ({
  type: types.NOTEBOOK_LOADING_BY_NAME,
  payload: {
    name,
    username,
    version
  }
})

export const loadedNotebookByName = (
  name: NotebookName,
  username: Username,
  notebook: Partial<Notebook>
): types.LoadedNotebookByName => ({
  type: types.NOTEBOOK_LOADED_BY_NAME,
  payload: {
    name,
    username,
    notebook
  }
})

export const loadFailedNotebookByName = (
  name: NotebookName,
  username: Username,
  error: Error | unknown,
  version?: NotebookVersion
): types.LoadFailedNotebookByName => ({
  type: types.NOTEBOOK_LOAD_FAILED_BY_NAME,
  payload: {
    error,
    name,
    username,
    version
  }
})

export const loadingNotebookByHostname = (
  hostname: NotebookHostname
): types.LoadingNotebookByHostname => ({
  type: types.NOTEBOOK_LOADING_BY_HOSTNAME,
  payload: {
    hostname
  }
})

export const loadedNotebookByHostname = (
  hostname: NotebookHostname,

  notebook: Partial<Notebook>
): types.LoadedNotebookByHostname => ({
  type: types.NOTEBOOK_LOADED_BY_HOSTNAME,
  payload: {
    hostname,
    notebook
  }
})

export const loadFailedNotebookByHostname = (
  hostname: NotebookHostname,
  error: Error | unknown
): types.LoadFailedNotebookByHostname => ({
  type: types.NOTEBOOK_LOAD_FAILED_BY_HOSTNAME,
  payload: {
    error,
    hostname
  }
})

export const enablingLinkSharing = (
  notebookId: NotebookID,
  enable: boolean
): types.EnablingLinkSharing => ({
  type: types.NOTEBOOK_ENABLING_LINK_SHARING,
  payload: {
    notebookId,
    enable
  }
})

export const enabledLinkSharing = (
  notebookId: NotebookID,
  enabled: boolean
): types.EnabledLinkSharing => ({
  type: types.NOTEBOOK_ENABLED_LINK_SHARING,
  payload: {
    notebookId,
    enabled
  }
})

export const enableFailedLinkSharing = (
  notebookId: NotebookID,
  enable: boolean,
  error: Error | unknown
): types.EnableFailedLinkSharing => ({
  type: types.NOTEBOOK_ENABLE_FAILED_LINK_SHARING,
  payload: {
    notebookId,
    enable,
    error
  }
})

export const publishingNotebook = (
  notebookId: NotebookID,
  version: NotebookVersion,
  title?: string,
  name?: NotebookName,
  notebookRevision?: NotebookRevision
): types.PublishingNotebook => ({
  type: types.NOTEBOOK_PUBLISHING,
  payload: {
    notebookId,
    version,
    title,
    name,
    notebookRevision
  }
})

export const publishedNotebook = (
  notebookId: NotebookID,
  publishedVersion: NotebookVersion
): types.PublishedNotebook => ({
  type: types.NOTEBOOK_PUBLISHED,
  payload: {
    notebookId,
    publishedVersion
  }
})

export const publishFailedNotebook = (
  notebookId: NotebookID,
  version: NotebookVersion,
  error: Error | unknown
): types.PublishFailedNotebook => ({
  type: types.NOTEBOOK_PUBLISH_FAILED,
  payload: {
    notebookId,
    version,
    error
  }
})

export const deployingNotebook = (
  notebookId: NotebookID,
  hostname: NotebookHostname
): types.DeployingNotebook => ({
  type: types.NOTEBOOK_DEPLOYING,
  payload: {
    notebookId,
    hostname
  }
})

export const deployedNotebook = (
  notebookId: NotebookID,
  hostname: NotebookHostname
): types.DeployedNotebook => ({
  type: types.NOTEBOOK_DEPLOYED,
  payload: {
    notebookId,
    hostname
  }
})

export const deployFailedNotebook = (
  notebookId: NotebookID,
  hostname: NotebookHostname,
  error: Error | unknown
): types.DeployFailedNotebook => ({
  type: types.NOTEBOOK_DEPLOY_FAILED,
  payload: {
    notebookId,
    hostname,
    error
  }
})

export const updatingNotebookTags = (
  notebookId: NotebookID,
  tag: NotebookTag,
  op: 'add' | 'remove'
): types.UpdateginNotebookTags => ({
  type: types.NOTEBOOK_TAGS_UPDATING,
  payload: {
    notebookId,
    tag,
    op
  }
})

export const updatedNotebookTags = (
  notebookId: NotebookID,
  tag: NotebookTag,
  result: NotebookTag[]
): types.UpdatedNotebookTags => ({
  type: types.NOTEBOOK_TAGS_UPDATED,
  payload: {
    notebookId,
    tag,
    result
  }
})

export const updateFailedNotebookTags = (
  notebookId: NotebookID,
  tag: NotebookTag,
  error: Error | unknown,
  op: 'add' | 'remove'
): types.UpdateFailedNotebookTags => ({
  type: types.NOTEBOOK_TAGS_FAILED,
  payload: {
    notebookId,
    tag,
    op,
    error
  }
})
