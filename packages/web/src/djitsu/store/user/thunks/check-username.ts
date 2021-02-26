import { AppThunk } from 'djitsu/store'

export const checkUsername = (username: string): AppThunk => async (
  _dispatch,
  _getState,
  { djitsu }
) => {
  if (!djitsu.user) throw new Error('User service is not available')

  const check = await djitsu.user.checkUsername(username)
  return check
}

export default checkUsername
