import { AppThunk } from 'djitsu/store'
import { signIn } from '../actions'
import { ProviderID } from 'djitsu/schema/auth'

export const providerSignin = (
  provider: ProviderID,
  remember: boolean
): AppThunk => async (dispatch, _getState, { djitsu }) => {
  if (!djitsu.auth) throw new Error('Auth service is not available')

  dispatch(signIn(provider))
  await djitsu.auth.signinWithProvider(provider, {
    remember
  })
}

export default providerSignin
