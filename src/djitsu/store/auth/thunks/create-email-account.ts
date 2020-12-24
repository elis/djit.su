import { AppThunk } from 'djitsu/store'
import { signIn, signedIn } from '../actions'
import { ProviderID } from 'djitsu/schema/auth'

export const createEmailAccount = (
  email: string,
  password: string,
  remember: boolean
): AppThunk => async (dispatch, _getState, { djitsu }) => {
  if (!djitsu.auth) throw new Error('Auth service is not available')

  dispatch(signIn(ProviderID.password, email))
  const res = await djitsu.auth.createEmailAccount(email, password, remember)
  dispatch(signedIn(res))
  return res
}

export default createEmailAccount
