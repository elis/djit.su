import { AppThunk } from 'djitsu/store'
import { UserID, Username } from 'djitsu/schema/user'
import { creatingUser, userCreated, accountAuthenticated } from '../actions'

export const createUser = (uid: UserID, username: Username): AppThunk => async (
  dispatch,
  _getState,
  { djitsu }
) => {
  if (!djitsu.user) throw new Error('User service is not available')

  dispatch(creatingUser(uid, username))
  await djitsu.user.createUser(uid, username)
  dispatch(userCreated(uid, username))
  dispatch(accountAuthenticated(uid, username))
}

export default createUser
