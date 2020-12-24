import { EditorBlock } from 'djitsu/schema/editor'
import { Timestamp } from 'djitsu/schema/generics'
import { Notebook, NotebookID } from 'djitsu/schema/notebook'

export namespace NotebookContext {
  export type ContextValue = [NotebookState, NotebookActions]

  export interface NotebookState {
    currentNotebook?: CurrentNotebook
    notebooks: Record<NotebookID, Partial<Notebook>>
  }

  export interface CurrentNotebook {
    notebookId: NotebookID
    state: Partial<CurrentNotebookState>
    notebook: Partial<Notebook>
    storedNotebook: Partial<Notebook>
    tempNotebook: Partial<Notebook>
    unsavedNotebook: Partial<Notebook>
  }

  export interface CurrentNotebookState {
    loading: boolean
    loaded: boolean
    ready: boolean

    processing: boolean
    saving: boolean

    lastUserChange: Timestamp
    lastServerUpdate: Timestamp
  }

  export interface NotebookActions {
    loadNotebook: (
      notebookId: NotebookID,
      revision?: NotebookRevision
    ) => Promise<Partial<Notebook>>

    setCurrentNotebookId: (notebookId?: NotebookID) => boolean

    onNotebookChange: (
      notebookId: NotebookID,
      blocks: EditorBlock[],
      properties?: Record<string, unknown>
    ) => Promise<boolean>
  }
}
