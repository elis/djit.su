import { AppThunk } from 'djitsu/store'
import { NotebookID, NotebookMetaAction } from 'djitsu/schema/notebook'
import { Username } from 'djitsu/schema/user'
import {
  loadedNotebookUserMeta,
  loadFailedNotebookUserMeta,
  loadingNotebookUserMeta
} from '../actions'

export const getNotebookUserMeta = (
  username: Username,
  notebookId: NotebookID,
  meta?: NotebookMetaAction
): AppThunk => async (dispatch, _getState, { djitsu }) => {
  if (!djitsu.notebook) throw new Error('Notebook service not available')
  if (!djitsu.user) throw new Error('User service not available')

  dispatch(loadingNotebookUserMeta(username, notebookId, meta))
  try {
    const result = await djitsu.notebook.getNotebookUserMeta(
      username,
      notebookId,
      meta
    )
    dispatch(loadedNotebookUserMeta(result, username, notebookId, meta))
  } catch (error) {
    dispatch(loadFailedNotebookUserMeta(error, username, notebookId, meta))
    throw error
  }
}

export const forkNotebook = (
  username: Username,
  notebookId: NotebookID
): AppThunk => async (_dispatch, _getState, { djitsu }) => {
  if (!djitsu.notebook) throw new Error('Notebook service not available')
  if (!djitsu.user) throw new Error('User service not available')

  return djitsu.notebook.meta(NotebookMetaAction.Fork, username, notebookId, 1)
}

export const likeNotebook = (
  username: Username,
  notebookId: NotebookID,
  isLike = true
): AppThunk => async (_dispatch, _getState, { djitsu }) => {
  if (!djitsu.notebook) throw new Error('Notebook service not available')
  if (!djitsu.user) throw new Error('User service not available')

  return djitsu.notebook.meta(
    NotebookMetaAction.Like,
    username,
    notebookId,
    isLike
  )
}
export const starNotebook = (
  username: Username,
  notebookId: NotebookID,
  isStar = true
): AppThunk => async (_dispatch, _getState, { djitsu }) => {
  if (!djitsu.notebook) throw new Error('Notebook service not available')
  if (!djitsu.user) throw new Error('User service not available')

  return djitsu.notebook.meta(
    NotebookMetaAction.Star,
    username,
    notebookId,
    isStar
  )
}
// export const starNotebook = (
//   username: Username,
//   notebookId: NotebookID,
//   isLike = true
// ) => {
//   return metaNotebook('star', username, notebookId)
// }

// export const metaNotebook = (
//   meta: string,
//   username: Username,
//   notebookId: NotebookID,
//   value: unknown
// ): AppThunk => async (dispatch, _getState, { djitsu }) => {
//   if (!djitsu.notebook) throw new Error('Notebook service not available')
//   if (!djitsu.user) throw new Error('User service not available')
//   // if (!username) throw new Error('Username is required')
// }
