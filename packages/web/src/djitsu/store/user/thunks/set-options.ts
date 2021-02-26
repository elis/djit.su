import { AppThunk } from 'djitsu/store'
import { Username } from 'djitsu/schema/user'
import {
  settingUserOptions,
  setFailedUserOptions,
  setUserOptions
} from '../actions'

export const setOptions = (
  username: Username,
  option: string,
  value: unknown
): AppThunk => async (dispatch, _getState, { djitsu }) => {
  if (!djitsu.user) throw new Error('User service is not available')

  dispatch(settingUserOptions(username, option, value))
  try {
    await djitsu.user.setOptions(username, option, value)
    dispatch(setUserOptions(username, option, value))
  } catch (error) {
    dispatch(setFailedUserOptions(username, option, value, error))
    throw error
  }
}

export default setOptions
