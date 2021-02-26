import { AppThunk } from 'djitsu/store'
import { Username } from 'djitsu/schema/user'
import {
  loadedUserNotebooks,
  loadFailedUserNotebooks,
  loadingUserNotebooks
} from '../actions'
import { NotebooksQuery } from 'djitsu/schema/notebook'

export const getUserNotebooks = (
  username: Username,
  query?: NotebooksQuery
): AppThunk => async (dispatch, _getState, { djitsu }) => {
  if (!djitsu.notebook) throw new Error('Notebook service not available')
  if (!username) throw new Error('Username is required')

  dispatch(loadingUserNotebooks(username, query))
  try {
    const notebooks = await djitsu.notebook.getUserNotebooks(username, query)
    dispatch(loadedUserNotebooks(notebooks, username, query))
    return notebooks
  } catch (error) {
    dispatch(loadFailedUserNotebooks(error, username, query))
    throw error
  }
}
