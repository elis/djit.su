import { AppThunk } from 'djitsu/store'
import {
  NotebookHostname,
  NotebookID,
  NotebookName,
  NotebookRevision,
  NotebookVersion
} from 'djitsu/schema/notebook'
import { Username } from 'djitsu/schema/user'
import {
  loadedNotebook,
  loadedNotebookByHostname,
  loadedNotebookByName,
  loadFailedNotebook,
  loadFailedNotebookByHostname,
  loadFailedNotebookByName,
  loadingNotebook,
  loadingNotebookByHostname,
  loadingNotebookByName
} from '../actions'

export const getNotebook = (
  notebookId: NotebookID,
  revision?: NotebookRevision
): AppThunk => async (dispatch, getState, { djitsu }) => {
  if (!djitsu.notebook) throw new Error('Notebook service not available')
  if (!notebookId) throw new Error('Notebook ID is required')

  dispatch(loadingNotebook(notebookId, revision))
  try {
    const result = await djitsu.notebook.getNotebook(notebookId, revision)
    dispatch(loadedNotebook(notebookId, result, revision))
    const state = getState()

    const retNotebook = state.notebook.notebooks[notebookId]

    return retNotebook
  } catch (error) {
    dispatch(loadFailedNotebook(notebookId, error, revision))
    throw error
  }
}

export const getNotebookId = (
  name: string,
  username: string
): AppThunk => async (_dispatch, _getState, { djitsu }) => {
  if (!djitsu.notebook) throw new Error('Notebook service not available')

  const retid = await djitsu.notebook.getNotebookId(name, username)
  return retid
}

export const getNotebookByName = (
  name: NotebookName,
  username: Username,
  version?: NotebookVersion
): AppThunk => async (dispatch, _getState, { djitsu }) => {
  if (!djitsu.notebook) throw new Error('Notebook service not available')

  dispatch(loadingNotebookByName(name, username, version))
  try {
    const retNotebook = await djitsu.notebook.getNotebookByName(
      name,
      username,
      version
    )
    dispatch(loadedNotebookByName(name, username, retNotebook))
    if (retNotebook.notebookId)
      dispatch(
        loadedNotebook(
          retNotebook.notebookId,
          retNotebook,
          retNotebook.meta?.revision
        )
      )

    return retNotebook
  } catch (error) {
    dispatch(loadFailedNotebookByName(name, username, error, version))
    throw error
  }
}

export const getNotebookByHostname = (
  hostname: NotebookHostname
): AppThunk => async (dispatch, _getState, { djitsu }) => {
  if (!djitsu.notebook) throw new Error('Notebook service not available')

  dispatch(loadingNotebookByHostname(hostname))
  try {
    const retNotebook = await djitsu.notebook.getNotebookByHostname(hostname)
    dispatch(loadedNotebookByHostname(hostname, retNotebook))
    if (retNotebook.notebookId)
      dispatch(
        loadedNotebook(
          retNotebook.notebookId,
          retNotebook,
          retNotebook.meta?.revision
        )
      )

    return retNotebook
  } catch (error) {
    dispatch(loadFailedNotebookByHostname(hostname, error))
    throw error
  }
}
