import { AppThunk } from 'djitsu/store'
import { NotebookID, NotebookTag } from 'djitsu/schema/notebook'

import {
  updatingNotebookTags,
  updatedNotebookTags,
  updateFailedNotebookTags
} from '../actions'

export const addNotebookTag = (
  notebookId: NotebookID,
  tag: NotebookTag
): AppThunk => async (dispatch, _getState, { djitsu }) => {
  if (!djitsu.notebook) throw new Error('Notebook service not available')

  dispatch(updatingNotebookTags(notebookId, tag, 'add'))
  try {
    const result = await djitsu.notebook.addNotebookTag(notebookId, tag)
    dispatch(updatedNotebookTags(notebookId, tag, result))
  } catch (error) {
    dispatch(updateFailedNotebookTags(error, notebookId, tag, 'add'))
    throw error
  }
}

export const removeNotebookTag = (
  notebookId: NotebookID,
  tag: NotebookTag
): AppThunk => async (dispatch, _getState, { djitsu }) => {
  if (!djitsu.notebook) throw new Error('Notebook service not available')

  dispatch(updatingNotebookTags(notebookId, tag, 'remove'))
  try {
    const result = await djitsu.notebook.removeNotebookTag(notebookId, tag)
    dispatch(updatedNotebookTags(notebookId, tag, result))
  } catch (error) {
    dispatch(updateFailedNotebookTags(error, notebookId, tag, 'remove'))
    throw error
  }
}
// addNotebookTag
// removeNotebookTag
