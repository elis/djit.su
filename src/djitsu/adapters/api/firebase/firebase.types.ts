import {
  CompiledNotebook,
  Notebook,
  NotebookHostname,
  NotebookID,
  NotebookName,
  NotebookRevision,
  NotebookVersion
} from 'djitsu/schema/notebook'
import { Username } from 'djitsu/schema/user'

export type FirebasePublicNotebook = Notebook

type NotebookDocumentPublish =
  | {
      isPublished: true
      name: NotebookName
      version: NotebookVersion // The current published version
      lastVersion: NotebookVersion // The last released version

      published: firebase.firestore.Timestamp // Initial publish date
      released: firebase.firestore.Timestamp // Version release date

      title: string
      description?: string
      previewPhotoUrl?: string
    }
  | {
      isPublished?: false

      title?: string
      description?: string
      previewPhotoUrl?: string
    }

type NotebookDocumentFork =
  | {
      forkOf: NotebookID
      forkRevision: NotebookRevision
      forkVersion?: NotebookVersion
    }
  | { forkOf?: false }

type NotebookDocumentRevisioned =
  | {
      lastRevision: NotebookRevision
      lastRevisionRef: firebase.firestore.DocumentReference
    }
  | { lastRevision?: false }

type NotebookDocumentBase = {
  username: Username
  created: firebase.firestore.Timestamp
  updated: firebase.firestore.Timestamp
  isShared?: boolean
  isPublic?: boolean

  tags?: string[]
}

export type NotebookDocument = NotebookDocumentBase &
  NotebookDocumentPublish &
  NotebookDocumentFork &
  NotebookDocumentRevisioned

export interface XNotebookDocument {
  name?: NotebookName
  username: Username
  version?: NotebookVersion
  lastRevision?: NotebookRevision
  lastRevisionRef?: firebase.firestore.DocumentReference

  forkOf?: NotebookID
  forkRevision?: NotebookRevision
  forkVersion?: NotebookVersion

  created: firebase.firestore.Timestamp
  updated?: firebase.firestore.Timestamp
  published?: firebase.firestore.Timestamp // Initial publish date
  released?: firebase.firestore.Timestamp // Version release date

  title?: string
  description?: string
  previewPhotoUrl?: string

  isShared?: boolean
  isPublic?: boolean
  isPublished?: boolean
}

export interface PublishedNotebookDocument {
  name: NotebookName
  hostname: NotebookHostname
  notebookId: NotebookID
  version: NotebookVersion
  createdBy: Username

  forkOf: NotebookID
  forkRevision: NotebookRevision
  forkVersion: NotebookVersion

  released: firebase.firestore.Timestamp
  published: firebase.firestore.Timestamp

  title: string
  description: string
  previewPhotoUrl: string

  tags: string[]
}

export interface NotebookVersionDocument {
  released: firebase.firestore.Timestamp
  published: firebase.firestore.Timestamp

  title: string
  description: string
  blocks: SerializedBlock
  size: number
  compiled: CompiledNotebook
  previewPhotoUrl: string
}

export interface NotebookRevesionDocument {
  revision: NotebookRevision
  parentRevision: NotebookRevision

  created: firebase.firestore.Timestamp

  title: string
  description: string
  blocks: SerializedBlock
  blocksTime: number
  blocksCount: number
  size: number
  compiled: CompiledNotebook
  previewPhotoUrl: string
}

export type SerializedBlock = string

export type FirebaseCreated = { created: firebase.firestore.Timestamp }
export type FirebaseUpdated = { updated: firebase.firestore.Timestamp }

export type NotebookMetaStats = {
  versions: number
  'user-like': number
  like: number
  'user-star': number
  star: number
  'user-fork': number
  fork: number
}
