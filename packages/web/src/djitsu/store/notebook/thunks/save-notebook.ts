import { AppThunk } from 'djitsu/store'
import { Notebook } from 'djitsu/schema/notebook'

export const saveNotebook = (
  notebookId: string,
  notebookData: Partial<Notebook>
): AppThunk => async (_dispatch, _getState, { djitsu }) => {
  return djitsu.notebook?.saveNotebook(notebookId, notebookData)
}
