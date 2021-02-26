import { AppThunk } from 'djitsu/store'
import {
  stateListenerAttached,
  stateListenerDetached,
  signedOut
} from '../actions'
import { AuthStateListener } from 'djitsu/schema/auth'
import { UserID } from 'djitsu/schema/user'
import handleUserSignin from './handle-user-signin'

export const addAuthStateListener = (listener: AuthStateListener): AppThunk => (
  dispatch,
  _getState,
  api
) => {
  const { djitsu } = api
  if (!djitsu.auth) throw new Error('Auth service is not available')

  dispatch(stateListenerAttached())

  const outerListener: AuthStateListener = (user) => {
    if (user) {
      handleUserSignin({
        uid: user.uid as UserID,
        user
      })(dispatch, _getState, api)
    } else {
      dispatch(signedOut())
    }

    listener(user)
  }

  const unsub = djitsu.auth.onAuthStateChanged(outerListener)
  const outerUnsub = () => {
    dispatch(stateListenerDetached())
    unsub()
  }
  return outerUnsub
}

export default addAuthStateListener
