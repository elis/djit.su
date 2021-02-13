import { AppThunk } from 'djitsu/store'
import {
  NotebookID,
  NotebookName,
  NotebookRevision,
  NotebookVersion
} from 'djitsu/schema/notebook'
import {
  publishingNotebook,
  publishedNotebook,
  publishFailedNotebook
} from '../actions'
import { logEvent } from 'djitsu/services/telemetry'

export const publishNotebook = (
  notebookId: NotebookID,
  version: NotebookVersion,
  title?: string,
  name?: NotebookName,
  notebookRevision?: NotebookRevision
): AppThunk => async (dispatch, _getState, { djitsu }) => {
  if (!djitsu.notebook) throw new Error('Notebook service unavailable')

  dispatch(
    publishingNotebook(notebookId, version, title, name, notebookRevision)
  )
  try {
    const result = await djitsu.notebook?.publishNotebook(
      notebookId,
      version,
      title,
      name,
      notebookRevision
    )
    dispatch(publishedNotebook(notebookId, result))
    logEvent('Notebook published', { notebookId, version: result })
    return result
  } catch (error) {
    dispatch(publishFailedNotebook(notebookId, version, error))
    logEvent('Notebook failed to publish', { notebookId, version, error })
    throw error
  }
}
