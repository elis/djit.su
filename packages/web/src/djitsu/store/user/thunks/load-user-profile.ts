import { AppThunk } from 'djitsu/store'
import { UserProfile } from 'djitsu/schema/user'
import {
  loadedUserProfile,
  loadingUserProfile,
  loadFailedUserProfile
} from '../actions'

export const loadUserProfile = (username: string): AppThunk => async (
  dispatch,
  _getState,
  api
): Promise<Partial<UserProfile>> => {
  const { djitsu } = api
  if (!djitsu.user) throw new Error('User service is not avaiable')

  dispatch(loadingUserProfile(username))
  try {
    const result = await djitsu.user.getProfile(username)
    dispatch(loadedUserProfile(username, result))
    return result
  } catch (error) {
    dispatch(loadFailedUserProfile(username, error))
    throw error
  }
}
