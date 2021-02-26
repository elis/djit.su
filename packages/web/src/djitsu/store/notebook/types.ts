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

export const NOTEBOOK_LOADING_USER_NOTEBOOKS = 'notebook/loading-user-notebooks'
export const NOTEBOOK_LOADED_USER_NOTEBOOKS = 'notebook/loaded-user-notebooks'
export const NOTEBOOK_LOAD_FAILED_USER_NOTEBOOKS =
  'notebook/load-failed-user-notebooks'

export const NOTEBOOK_LOADING_USER_META = 'notebook/loading-user-meta'
export const NOTEBOOK_LOADED_USER_META = 'notebook/loaded-user-meta'
export const NOTEBOOK_LOAD_FAILED_USER_META = 'notebook/load-failed-user-meta'

export const NOTEBOOK_SAVING_REVISION = 'notebook/saving-notebook-revision'
export const NOTEBOOK_SAVED_REVISION = 'notebook/saved-notebook-revision'
export const NOTEBOOK_SAVE_FAILED_REVISION =
  'notebook/save-failed-notebook-revision'

export const NOTEBOOK_LOADING_REVISION = 'notebook/loading-notebook-revision'
export const NOTEBOOK_LOADED_REVISION = 'notebook/loaded-notebook-revision'
export const NOTEBOOK_LOAD_FAILED_REVISION =
  'notebook/load-failed-notebook-revision'

export const NOTEBOOK_LOADING_BY_NAME = 'notebook/loading-notebook-by-name'
export const NOTEBOOK_LOADED_BY_NAME = 'notebook/loaded-notebook-by-name'
export const NOTEBOOK_LOAD_FAILED_BY_NAME =
  'notebook/load-failed-notebook-by-name'

export const NOTEBOOK_LOADING_BY_HOSTNAME =
  'notebook/loading-notebook-by-hostname'
export const NOTEBOOK_LOADED_BY_HOSTNAME =
  'notebook/loaded-notebook-by-hostname'
export const NOTEBOOK_LOAD_FAILED_BY_HOSTNAME =
  'notebook/load-failed-notebook-by-hostname'

export const NOTEBOOK_ENABLING_LINK_SHARING = 'notebook/enabling-link-sharing'
export const NOTEBOOK_ENABLED_LINK_SHARING = 'notebook/enabled-link-sharing'
export const NOTEBOOK_ENABLE_FAILED_LINK_SHARING =
  'notebook/enable-failed-link-sharing'

export const NOTEBOOK_PUBLISHING = 'notebook/publishing'
export const NOTEBOOK_PUBLISHED = 'notebook/published'
export const NOTEBOOK_PUBLISH_FAILED = 'publish-failed'

export const NOTEBOOK_DEPLOYING = 'notebook/deploying'
export const NOTEBOOK_DEPLOYED = 'notebook/deployed'
export const NOTEBOOK_DEPLOY_FAILED = 'deploy-failed'

export const NOTEBOOK_TAGS_UPDATING = 'notebook/tags-updating'
export const NOTEBOOK_TAGS_UPDATED = 'notebook/tags-updated'
export const NOTEBOOK_TAGS_FAILED = 'notebook/tags-update-failed'

export interface NotebookState {
  notebooks: Record<NotebookID, Partial<Notebook>>
  users?: Record<Username, Partial<UserRecord>>
}

type UserRecord = {
  queries: Record<string, UserQuery>
  notebooks: Record<NotebookID, Partial<Notebook>>
}

type UserQuery = {
  loading?: boolean
  result?: NotebookID[]
  error?: Error | unknown
}

export interface LoadingUserNotebooks {
  type: typeof NOTEBOOK_LOADING_USER_NOTEBOOKS
  payload: {
    username: Username
    query?: NotebooksQuery
  }
}

export interface LoadedUserNotebooks {
  type: typeof NOTEBOOK_LOADED_USER_NOTEBOOKS
  payload: {
    notebooks: Partial<Notebook>[]
    username: Username
    query?: NotebooksQuery
  }
}

export interface LoadFailedUserNotebooks {
  type: typeof NOTEBOOK_LOAD_FAILED_USER_NOTEBOOKS
  payload: {
    error: Error | unknown
    username: Username
    query?: NotebooksQuery
  }
}

export interface LoadingNotebookUserMeta {
  type: typeof NOTEBOOK_LOADING_USER_META
  payload: {
    notebookId: NotebookID
    username: Username
    meta?: NotebookMetaAction
  }
}

export interface LoadedNotebookUserMeta {
  type: typeof NOTEBOOK_LOADED_USER_META
  payload: {
    result: Partial<Record<NotebookMetaAction, Partial<NotebookMetaData>>>
    notebookId: NotebookID
    username: Username
    meta?: NotebookMetaAction
  }
}

export interface LoadFailedNotebookUserMeta {
  type: typeof NOTEBOOK_LOAD_FAILED_USER_META
  payload: {
    error: Error | unknown
    notebookId: NotebookID
    username: Username
    meta?: NotebookMetaAction
  }
}

export interface LoadingNotebookRevision {
  type: typeof NOTEBOOK_LOADING_REVISION
  payload: {
    notebookId: NotebookID
    revision?: NotebookRevision
  }
}

export interface LoadedNotebookRevision {
  type: typeof NOTEBOOK_LOADED_REVISION
  payload: {
    notebookId: NotebookID
    revision?: NotebookRevision
    notebook: Partial<Notebook>
  }
}

export interface LoadFailedNotebookRevision {
  type: typeof NOTEBOOK_LOAD_FAILED_REVISION
  payload: {
    notebookId: NotebookID
    revision?: NotebookRevision
    error: Error | unknown
  }
}

export interface SavingNotebookRevision {
  type: typeof NOTEBOOK_SAVING_REVISION
  payload: {
    notebookId: NotebookID
    notebook: Partial<Notebook>
  }
}

export interface SavedNotebookRevision {
  type: typeof NOTEBOOK_SAVED_REVISION
  payload: {
    notebookId: NotebookID
    notebook: Partial<Notebook>
    notebookRevision: NotebookRevision
  }
}

export interface SaveFailedNotebookRevision {
  type: typeof NOTEBOOK_SAVE_FAILED_REVISION
  payload: {
    notebookId: NotebookID
    error: Error | unknown
  }
}

export interface LoadingNotebookByName {
  type: typeof NOTEBOOK_LOADING_BY_NAME
  payload: {
    name: NotebookName
    username: Username
    version?: NotebookVersion
  }
}

export interface LoadedNotebookByName {
  type: typeof NOTEBOOK_LOADED_BY_NAME
  payload: {
    name: NotebookName
    username: Username
    notebook: Partial<Notebook>
  }
}

export interface LoadFailedNotebookByName {
  type: typeof NOTEBOOK_LOAD_FAILED_BY_NAME
  payload: {
    name: NotebookName
    username: Username
    error: Error | unknown
    version?: NotebookVersion
  }
}

export interface LoadingNotebookByHostname {
  type: typeof NOTEBOOK_LOADING_BY_HOSTNAME
  payload: {
    hostname: NotebookHostname
  }
}

export interface LoadedNotebookByHostname {
  type: typeof NOTEBOOK_LOADED_BY_HOSTNAME
  payload: {
    hostname: NotebookHostname
    notebook: Partial<Notebook>
  }
}

export interface LoadFailedNotebookByHostname {
  type: typeof NOTEBOOK_LOAD_FAILED_BY_HOSTNAME
  payload: {
    hostname: NotebookHostname
    error: Error | unknown
  }
}

export interface EnablingLinkSharing {
  type: typeof NOTEBOOK_ENABLING_LINK_SHARING
  payload: {
    notebookId: NotebookID
    enable: boolean
  }
}

export interface EnabledLinkSharing {
  type: typeof NOTEBOOK_ENABLED_LINK_SHARING
  payload: {
    notebookId: NotebookID
    enabled: boolean
  }
}

export interface EnableFailedLinkSharing {
  type: typeof NOTEBOOK_ENABLE_FAILED_LINK_SHARING
  payload: {
    notebookId: NotebookID
    enable: boolean
    error: Error | unknown
  }
}

export interface PublishingNotebook {
  type: typeof NOTEBOOK_PUBLISHING
  payload: {
    notebookId: NotebookID
    version: NotebookVersion
    title?: string
    name?: NotebookName
    notebookRevision?: NotebookRevision
  }
}

export interface PublishedNotebook {
  type: typeof NOTEBOOK_PUBLISHED
  payload: {
    notebookId: NotebookID
    publishedVersion: NotebookVersion
  }
}

export interface PublishFailedNotebook {
  type: typeof NOTEBOOK_PUBLISH_FAILED
  payload: {
    notebookId: NotebookID
    version: NotebookVersion
    error: Error | unknown
  }
}

export interface DeployingNotebook {
  type: typeof NOTEBOOK_DEPLOYING
  payload: {
    notebookId: NotebookID
    hostname: NotebookHostname
  }
}

export interface DeployedNotebook {
  type: typeof NOTEBOOK_DEPLOYED
  payload: {
    notebookId: NotebookID
    hostname: NotebookHostname
  }
}

export interface DeployFailedNotebook {
  type: typeof NOTEBOOK_DEPLOY_FAILED
  payload: {
    notebookId: NotebookID
    hostname: NotebookHostname
    error: Error | unknown
  }
}
export interface UpdateginNotebookTags {
  type: typeof NOTEBOOK_TAGS_UPDATING
  payload: {
    notebookId: NotebookID
    tag: NotebookTag
    op: 'add' | 'remove'
  }
}

export interface UpdatedNotebookTags {
  type: typeof NOTEBOOK_TAGS_UPDATED
  payload: {
    notebookId: NotebookID
    tag: NotebookTag
    result: NotebookTag[]
  }
}

export interface UpdateFailedNotebookTags {
  type: typeof NOTEBOOK_TAGS_FAILED
  payload: {
    notebookId: NotebookID
    tag: NotebookTag
    op: 'add' | 'remove'
    error: Error | unknown
  }
}

export type NotebookAction =
  | LoadingUserNotebooks
  | LoadedUserNotebooks
  | LoadFailedUserNotebooks
  | LoadingNotebookRevision
  | LoadedNotebookRevision
  | LoadFailedNotebookRevision
  | LoadingNotebookByName
  | LoadedNotebookByName
  | LoadFailedNotebookByName
  | LoadingNotebookByHostname
  | LoadedNotebookByHostname
  | LoadFailedNotebookByHostname
  | SavingNotebookRevision
  | SavedNotebookRevision
  | SaveFailedNotebookRevision
  | EnablingLinkSharing
  | EnabledLinkSharing
  | EnableFailedLinkSharing
  | PublishingNotebook
  | PublishedNotebook
  | PublishFailedNotebook
  | DeployingNotebook
  | DeployedNotebook
  | DeployFailedNotebook
  | LoadingNotebookUserMeta
  | LoadedNotebookUserMeta
  | LoadFailedNotebookUserMeta
  | UpdateginNotebookTags
  | UpdatedNotebookTags
  | UpdateFailedNotebookTags
