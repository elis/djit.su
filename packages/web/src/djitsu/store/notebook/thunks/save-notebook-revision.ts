import { AppThunk } from 'djitsu/store'
import { Notebook } from 'djitsu/schema/notebook'
import {
  savedNotebookRevision,
  saveFailedNotebookRevision,
  savingNotebookRevision
} from '../actions'

export const saveNotebookRevision = (
  notebookId: string,
  notebookData: Partial<Notebook>
): AppThunk => async (dispatch, getState, { djitsu }) => {
  if (!djitsu.notebook) throw new Error('Notebook service unailable')
  dispatch(savingNotebookRevision(notebookId, notebookData))

  const state = getState()
  const username = state.user.username
  if (!username) throw new Error('Cannot save revision without username')

  try {
    const result = await djitsu.notebook.saveNotebookRevision(
      notebookId,
      notebookData,
      username
    )

    dispatch(savedNotebookRevision(notebookId, notebookData, result))

    return result
  } catch (error) {
    dispatch(saveFailedNotebookRevision(notebookId, error))
    throw error
  }
}
