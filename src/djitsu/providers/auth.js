import React, { createContext, useContext, useCallback, useEffect } from 'react'
import { useDispatcher, useSelector } from 'djitsu/store'
import { addAuthStateListener } from 'djitsu/store/auth/thunks/add-auth-state-listener'

const AuthContext = createContext([])

export const AuthProvider = (props) => {
  const storeActions = useDispatcher({ addAuthStateListener })
  const authState = useSelector(({ auth }) => auth)

  const onAuthStateChanged = useCallback((user) => {
    if (props.onAuthStateChanged) {
      props.onAuthStateChanged?.(user)
    }
  }, [])

  useEffect(() => {
    const unsub = storeActions.addAuthStateListener(onAuthStateChanged)
    return () => {
      // oh yee, protect me from hmr crashes!
      if (unsub && typeof unsub === 'function') unsub()
    }
  }, [])

  const state = {
    currentUserID: authState.uid,
    authenticated: authState.authenticated
  }
  const actions = {}

  const context = [state, actions]
  return (
    <AuthContext.Provider value={context}>
      {props.children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export default AuthProvider
