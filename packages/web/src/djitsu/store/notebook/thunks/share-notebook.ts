import { AppThunk } from 'djitsu/store'
import {
  enabledLinkSharing,
  enableFailedLinkSharing,
  enablingLinkSharing
} from '../actions'

export const enableLinkSharing = (
  notebookId: string,
  enable: boolean
): AppThunk => async (dispatch, _getState, { djitsu }) => {
  if (!djitsu.notebook) throw new Error('Notebook service unavailable')

  dispatch(enablingLinkSharing(notebookId, enable))
  try {
    const result = await djitsu.notebook?.enableLinkSharing(notebookId, enable)
    dispatch(enabledLinkSharing(notebookId, result))
    return result
  } catch (error) {
    dispatch(enableFailedLinkSharing(notebookId, enable, error))
    throw error
  }
}
