import { AppThunk } from 'djitsu/store'
import {
  initAuthenticated,
  accountAuthenticated,
  accountAuthenticationFailed
} from '../actions'
import { UserID } from 'djitsu/schema/user'

export const userAuthenticated = (uid: UserID): AppThunk => async (
  dispatch,
  _getState,
  api
) => {
  const { djitsu } = api
  if (!djitsu.user) throw new Error('User service is not available')

  dispatch(initAuthenticated(uid))

  try {
    const user = await djitsu.user.loadAuthenticated(uid)
    dispatch(accountAuthenticated(uid, user.username, user.options))
  } catch (error) {
    dispatch(accountAuthenticationFailed(uid, error))
    throw error
  }
}

export default userAuthenticated
