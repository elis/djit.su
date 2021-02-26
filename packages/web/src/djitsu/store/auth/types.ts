import { UserID } from 'djitsu/schema/user'
import { AuthCredential, ProviderID } from 'djitsu/schema/auth'

export const INIT = 'auth/initialize'
export const AUTH_SIGN_IN = 'auth/sign-in'
export const AUTH_SIGNED_IN = 'auth/signed-in'
export const AUTH_SIGNED_OUT = 'auth/signed-out'
export const AUTH_STATE_LISTENER_ATTACHED = 'auth/state-listener-attached'
export const AUTH_STATE_LISTENER_DETACHED = 'auth/state-listener-detached'

export interface AuthInitialState {
  initialized: boolean
  credential?: Partial<AuthCredential>
  authenticated: boolean
  uid?: UserID
  signinProvider?: ProviderID
}

export interface InitializeAction {
  type: typeof INIT
  payload: {
    uid?: UserID
  }
}

export interface SignIn {
  type: typeof AUTH_SIGN_IN
  payload: {
    provider: ProviderID
    identifier?: string
  }
}

export interface SignedIn {
  type: typeof AUTH_SIGNED_IN
  payload: {
    credential: Partial<AuthCredential>
  }
}

export interface SignedOut {
  type: typeof AUTH_SIGNED_OUT
}

export interface StateListenerAttached {
  type: typeof AUTH_STATE_LISTENER_ATTACHED
}

export interface StateListenerDetached {
  type: typeof AUTH_STATE_LISTENER_DETACHED
}

export type AuthAction =
  | InitializeAction
  | SignIn
  | SignedIn
  | SignedOut
  | StateListenerAttached
  | StateListenerDetached
