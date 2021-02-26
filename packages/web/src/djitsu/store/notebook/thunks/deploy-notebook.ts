import { AppThunk } from 'djitsu/store'
import { NotebookHostname, NotebookID } from 'djitsu/schema/notebook'
import {
  deployingNotebook,
  deployedNotebook,
  deployFailedNotebook
} from '../actions'

export const deployNotebook = (
  notebookId: NotebookID,
  hostname: NotebookHostname
): AppThunk => async (dispatch, _getState, { djitsu }) => {
  if (!djitsu.notebook) throw new Error('Notebook service unavailable')

  dispatch(deployingNotebook(notebookId, hostname))
  try {
    const result = await djitsu.notebook?.deployNotebook(notebookId, hostname)
    dispatch(deployedNotebook(notebookId, hostname))
    return result
  } catch (error) {
    dispatch(deployFailedNotebook(notebookId, hostname, error))
    throw error
  }
}
