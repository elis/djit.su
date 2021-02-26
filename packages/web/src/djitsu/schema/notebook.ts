import { Block } from './block'
import { Timestamp } from './generics'
import { Username } from './user'

export interface NotebookService {
  addNotebookTag: (
    notebookId: NotebookID,
    tag: NotebookTag
  ) => Promise<NotebookTag[]>
  removeNotebookTag: (
    notebookId: NotebookID,
    tag: NotebookTag
  ) => Promise<NotebookTag[]>
  getUserNotebooks: (
    username: Username,
    query?: NotebooksQuery
  ) => Promise<Partial<Notebook>[]>
  getNotebookId: (
    notebookName: string,
    notebookUsername: string
  ) => Promise<NotebookID>
  getNotebookByName: (
    notebookName: string,
    notebookUsername: string,
    revision?: string
  ) => Promise<Partial<Notebook>>
  getNotebookByHostname: (hostname: string) => Promise<Partial<Notebook>>
  getNotebook: (
    notebookId: NotebookID,
    revision?: NotebookRevision
  ) => Promise<Partial<Notebook>>
  saveNotebook: (
    notebookId: string,
    notebook: Partial<Notebook>
  ) => Promise<string>
  saveNotebookRevision: (
    notebookId: NotebookID,
    notebook: Partial<Notebook>,
    username: Username
  ) => Promise<NotebookRevision>
  newNotebook: (
    username: Username,
    notebookId?: NotebookID
  ) => Promise<NotebookID>

  enableLinkSharing: (
    notebookId: NotebookID,
    enable: boolean
  ) => Promise<boolean>

  publishNotebook: (
    notebookId: NotebookID,
    version: NotebookVersion,
    title?: string,
    name?: NotebookName,
    notebookRevision?: NotebookRevision
  ) => Promise<NotebookVersion>
  deployNotebook: (
    notebookId: NotebookID,
    hostname: NotebookHostname
  ) => Promise<true>
  getNotebookUserMeta: (
    username: Username,
    notebookId: NotebookID,
    meta?: NotebookMetaAction
  ) => Promise<Partial<Record<NotebookMetaAction, Partial<NotebookMetaData>>>>
  meta: (
    meta: NotebookMetaAction,
    username: NotebookVersion,
    notebookId: NotebookID,
    value: unknown
  ) => Promise<unknown>
}

export interface Notebook {
  notebookId?: NotebookID
  name?: NotebookName
  meta: Partial<NotebookMeta>
  status: Partial<NotebookStatus>
  properties: Partial<NotebookProperties>
  blocks: Block[]
  compiled: CompiledNotebook
}

export type NotebookID = string
export type NotebookName = string
export type NotebookHostname = string

export type NotebookVersion = string
export type NotebookRevision = number

export interface NotebookMeta {
  version: NotebookVersion // Notebook version
  latestVersion?: NotebookVersion
  revision?: NotebookRevision
  latestRevision?: NotebookRevision

  created: Timestamp
  updated: Timestamp
  revised: Timestamp // When the revision was created
  released: Timestamp // When the first time the notebook was published
  published: Timestamp // When the current version was published
  blocksTime: Timestamp
  blocksCount: number

  forkOf: NotebookID
  forkRevision: NotebookRevision
  forkVersion: NotebookVersion

  createdBy: Username

  isShared: boolean // shared with specific people
  isPublic: boolean // shared via link sharing
  isPublished: boolean

  size: number

  isLiked: boolean // User likes this
  isStarred: boolean // User starred this
  isForked: boolean // User forked this
}

export interface NotebookProperties {
  title: string // Plain human redable title
  description: string
  name: string // public facing name - @user/{notebook.name}
  hostname: NotebookHostname // pulic hostname
  previewPhotoUrl: string
  tags: NotebookTags
}

export type NotebookTags = NotebookTag[]
export type NotebookTag = string
export interface NotebookStatus {
  sessionSaving: boolean
  sessionLastSave: number
  loading: boolean
  loaded: boolean

  sharing: boolean
  publishing: boolean

  error: Error | unknown
}

export enum NotebookError {
  Unavailable = 'notebook-unavailable',
  Restricted = 'notebook-restricted',
  Exists = 'notebook-exists',
  NoUser = 'no-user',
  VersionUnavailable = 'no-version',
  RevisionUnavailable = 'no-revision',
  VersionExists = 'version-exists',
  NameRequired = 'name-required',
  TitleRequired = 'title-required',
  UnknownHostname = 'unknown-hostname'
}

export enum NotebookMetaAction {
  Like = 'like',
  Star = 'star',
  Fork = 'fork'
}

export type NotebookMetaData = {
  created: Timestamp
  updated?: Timestamp
  value: unknown
}

export interface CompiledNotebook {
  code: string
  imports: string[]
  exports: string[]
  size: number
}

export type NotebooksQuery = {
  pageSize?: number
  order?: 'desc' | 'asc'
  orderBy?: NotebooksOrderBy
  startAfter?: unknown
  whereIs?: Record<string, unknown>[]
  whereIn?: Record<string, unknown[]>[]
  whereIsnt?: Record<string, unknown>[]
}

export enum NotebooksOrderBy {
  Created = 'created',
  Updated = 'updated'
}
