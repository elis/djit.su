import { AppThunk } from 'djitsu/store'
import { UserMetaStats } from 'djitsu/schema/user'
import { loadingUserMeta, loadedUserMeta, loadFailedUserMeta } from '../actions'

export const loadUserMetaStats = (username: string): AppThunk => async (
  dispatch,
  _getState,
  api
): Promise<Partial<UserMetaStats>> => {
  const { djitsu } = api
  if (!djitsu.user) throw new Error('User service is not avaiable')

  dispatch(loadingUserMeta(username))
  try {
    const result = await djitsu.user.getMetaStats(username)
    dispatch(loadedUserMeta(username, result))
    return result
  } catch (error) {
    dispatch(loadFailedUserMeta(username, error))
    throw error
  }
}
