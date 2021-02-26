import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from 'react'
import { useSelector, useDispatcher } from 'djitsu/store'
import { userAuthenticated } from 'djitsu/store/user/thunks/user-authenticated'
import { loadUserProfile as loadUserProfileStore } from 'djitsu/store/user/thunks/load-user-profile'
import { loadUserMetaStats as loadUserMetaStatsStore } from 'djitsu/store/user/thunks/load-user-meta-stats'
import { UserError } from 'djitsu/schema/user'
import { createUser } from 'djitsu/store/user/thunks/create-user'
import userDisconnected from 'djitsu/store/user/thunks/user-disconnected'
import useStates from 'djitsu/utils/hooks/use-states'
import setOptions from 'djitsu/store/user/thunks/set-options'

const UserContext = createContext([])

export const UserProvider = (props) => {
  const [currentUserID, setCurrentUserID] = useState()
  const [currentUsername, setCurrentUsername] = useState()
  const [userState, authState] = useSelector(({ user, auth }) => [user, auth])

  const storeActions = useDispatcher({
    userAuthenticated,
    createUser,
    userDisconnected,
    loadUserProfile: loadUserProfileStore,
    loadUserMetaStats: loadUserMetaStatsStore,
    setOptions
  })

  const handleUserAuthenticated = useCallback(async () => {
    if (!authState.authenticated) {
      await storeActions.userDisconnected()
      setCurrentUserID()
      setCurrentUsername()
    } else {
      try {
        await storeActions.userAuthenticated(authState.uid)
      } catch (error) {
        console.log('Error loading authenticated', error)
        if (error?.message === UserError.NO_USER_DOCUMENT) {
          console.log('create user document?')
        } else if (error?.message !== UserError.NO_ACCOUNT) {
          throw error
        }
      }
    }
    setCurrentUserID(authState.uid)

    // TODO: Update last seen
  }, [authState, currentUserID])

  const [userProfiles, setUserProfile] = useStates()

  /** @type {loadUserProfile} */
  const loadUserProfile = useCallback(async (username) => {
    const result = await storeActions.loadUserProfile(username)
    // console.log('Loaded user profile:', result)
    setUserProfile(username, (v) => ({ ...v, ...result }))
    return result
  }, [])

  /** @type {loadUserMetaStats} */
  const loadUserMetaStats = useCallback(async (username) => {
    const result = await storeActions.loadUserMetaStats(username)
    // console.log('Loaded user profile:', result)
    setUserProfile(username, (v) => ({ ...v, stats: result }))
    return result
  }, [])

  /** @type {setOption} */
  const setOption = useCallback(
    async (option, value) => {
      return storeActions.setOptions(currentUsername, option, value)
    },
    [currentUsername]
  )

  useEffect(() => {
    if (
      currentUserID !== authState.uid ||
      (authState.initialized && !authState.authenticated)
    ) {
      // Load user data
      handleUserAuthenticated()
    }
  }, [authState, currentUserID])

  useEffect(() => {
    if (
      userState.authenticatedUserID &&
      userState.username &&
      currentUsername !== userState.username
    ) {
      setCurrentUsername(userState.username)
    }
  }, [userState])
  useEffect(() => {
    if (currentUsername) {
      loadUserProfile(currentUsername)
    }
  }, [currentUsername])

  const state = {
    initialized: userState.initiailized,
    currentUserID,
    currentUsername,
    ...(authState.signinProvider
      ? { signinProvider: authState.signinProvider }
      : {}),

    userProfiles,
    options: userState?.options
  }
  const actions = {
    loadUserProfile,
    loadUserMetaStats,
    setOption
  }

  const context = [state, actions]
  return (
    <UserContext.Provider value={context}>
      {props.children}
    </UserContext.Provider>
  )
}

/** @returns {[UseUserState, UseUserActions]} */
export const useUser = () => useContext(UserContext)

export default UserProvider

/**
 * @typedef {import('djitsu/schema/user').Username} Username
 * @typedef {import('djitsu/schema/user').UserID} Username
 * @typedef {import('djitsu/schema/user').UserProfile} UserProfile
 * @typedef {import('djitsu/schema/user').UserOptions} UserOptions
 * @typedef {import('djitsu/schema/auth').ProviderID} ProviderID
 */

/**
 * @typedef {Object} UseUserState
 * @property {boolean} initialized
 * @property {UserID} currentUserID
 * @property {Username} currentUsername
 * @property {ProviderID} signinProvider
 *
 * @property {{[Username]: Partial<UserProfile>}} userProfiles
 * @property {Partial<UserOptions>} options
 */

/**
 * @typedef {Object} UseUserActions
 * @property {loadUserProfile} loadUserProfile
 * @property {loadUserMetaStats} loadUserMetaStats
 * @property {setOption} setOption
 */

/**
 * @callback loadUserProfile
 * @param {Username} username
 * @returns {Partial<UserProfile>}
 */

/**
 * @callback loadUserMetaStats
 * @param {Username} username
 * @returns {Partial<UserMetaStats>}
 */

/**
 * @callback setOption
 * @param {string} option
 * @param {any | (currentValue) => any} value
 * @returns {void}
 */
