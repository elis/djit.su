import { AppThunk } from 'djitsu/store'
import { signIn } from '../actions'
import { ProviderID } from 'djitsu/schema/auth'

export const emailSignin = (
  email: string,
  password: string,
  remember: boolean
): AppThunk => async (dispatch, _getState, { djitsu }) => {
  if (!djitsu.auth) throw new Error('Auth service is not available')

  dispatch(signIn(ProviderID.password, email))
  await djitsu.auth.signinWithPassword(email, password, remember)
}

export default emailSignin
