import * as auth from './types'
import { ProviderID } from 'djitsu/schema/auth'

const initialState: auth.AuthInitialState = {
  initialized: false,
  authenticated: false
}

export const authReducer = (
  state = initialState,
  action: auth.AuthAction
): auth.AuthInitialState => {
  switch (action.type) {
    case auth.AUTH_SIGN_IN:
      return {
        ...state,
        signinProvider: action.payload.provider
      }
    case auth.AUTH_SIGNED_IN:
      return {
        ...state,
        ...(!state.initialized ? { initialized: true } : {}),
        ...(!state.signinProvider
          ? {
              signinProvider:
                action.payload.credential.provider?.provider ||
                (action.payload.credential.user?.providerData?.[0]
                  ?.providerId as ProviderID)
            }
          : {}),
        uid: action.payload.credential.uid,
        authenticated: true,
        credential: action.payload.credential
      }
    case auth.AUTH_SIGNED_OUT:
      return {
        ...initialState,
        initialized: true
      }
    default:
      return state
  }
}
