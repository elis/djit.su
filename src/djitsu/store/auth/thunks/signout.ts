import { AppThunk } from 'djitsu/store'
import { signedOut } from '../actions'

export const signOut = (): AppThunk => async (
  dispatch,
  _getState,
  { djitsu }
) => {
  if (!djitsu.auth) throw new Error('Auth service is not available')

  await djitsu.auth.signOut()
  dispatch(signedOut())
}

export default signOut
