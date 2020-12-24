import * as types from './types'
import { AuthCredential, ProviderID } from 'djitsu/schema/auth'

export interface AuthAction {
  size: number
}

export const signIn = (
  provider: ProviderID,
  identifier?: string
): types.SignIn => ({
  type: types.AUTH_SIGN_IN,
  payload: {
    provider,
    identifier
  }
})

export const signedIn = (
  credential: Partial<AuthCredential>
): types.SignedIn => ({
  type: types.AUTH_SIGNED_IN,
  payload: {
    credential
  }
})

export const signedOut = (): types.SignedOut => ({
  type: types.AUTH_SIGNED_OUT
})

export const stateListenerAttached = (): types.StateListenerAttached => ({
  type: types.AUTH_STATE_LISTENER_ATTACHED
})

export const stateListenerDetached = (): types.StateListenerDetached => ({
  type: types.AUTH_STATE_LISTENER_DETACHED
})
