import { AppThunk } from 'djitsu/store'
import { NotebookID } from 'djitsu/schema/notebook'
import { Username } from 'djitsu/schema/user'

export const newNotebook = (
  username: Username,
  notebookId?: NotebookID
): AppThunk => async (_dispatch, _getState, { djitsu }) => {
  if (!djitsu.notebook) throw new Error('Notebook service unavailable')
  if (!username)
    throw new Error('Notebook cannot be created without a username')

  const newId = await djitsu.notebook.newNotebook(username, notebookId)

  return newId
}
