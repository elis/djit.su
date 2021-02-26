import * as types from './types'
import {
  UserID,
  UserMetaStats,
  Username,
  UserOptions,
  UserProfile
} from 'djitsu/schema/user'

export interface AuthAction {
  size: number
}

export const initAuthenticated = (
  uid: UserID
): types.InitializeAuthenticated => ({
  type: types.USER_INIT_AUTHENTICATED,
  payload: {
    uid
  }
})

export const creatingUser = (
  uid: UserID,
  username: Username
): types.CreatingUser => ({
  type: types.USER_CREATING_ACCOUNT,
  payload: {
    uid,
    username
  }
})

export const userCreated = (
  uid: UserID,
  username: Username
): types.UserCreated => ({
  type: types.USER_ACCOUNT_CREATED,
  payload: {
    uid,
    username
  }
})

export const accountAuthenticated = (
  uid: UserID,
  username: Username,
  options?: UserOptions
): types.AccountAuthenticated => ({
  type: types.USER_ACCOUNT_AUTHENTICATED,
  payload: {
    uid,
    username,
    options
  }
})

export const accountAuthenticationFailed = (
  uid: UserID,
  error: Error | unknown
): types.AccountAuthenticationFailed => ({
  type: types.USER_ACCOUNT_AUTHENTICATION_FAILED,
  payload: {
    uid,
    error
  }
})

export const accountDisconnected = (): types.AccountDisconnected => ({
  type: types.USER_ACCOUNT_DISCONNECTED
})

export const seedingAccount = (username: Username): types.AccountSeeding => ({
  type: types.USER_ACCOUNT_SEEDING,
  payload: {
    username
  }
})

export const accountSeeded = (username: Username): types.AccountSeeded => ({
  type: types.USER_ACCOUNT_SEEDED,
  payload: {
    username
  }
})

export const loadingUserProfile = (
  username: Username
): types.LoadingUserProfile => ({
  type: types.USER_LOADING_PROFILE,
  payload: {
    username
  }
})

export const loadedUserProfile = (
  username: Username,
  profile: Partial<UserProfile>
): types.LoadedUserProfile => ({
  type: types.USER_LOADED_PROFILE,
  payload: {
    username,
    profile
  }
})

export const loadFailedUserProfile = (
  username: Username,
  error: Error | unknown
): types.LoadFailedUserProfile => ({
  type: types.USER_LOAD_FAILED_PROFILE,
  payload: {
    username,
    error
  }
})

export const loadingUserMeta = (
  username: Username
): types.LoadingUserMetaStats => ({
  type: types.USER_LOADING_META_STATS,
  payload: {
    username
  }
})

export const loadedUserMeta = (
  username: Username,
  stats: Partial<UserMetaStats>
): types.LoadedUserMetaStats => ({
  type: types.USER_LOADED_META_STATS,
  payload: {
    username,
    stats
  }
})

export const loadFailedUserMeta = (
  username: Username,
  error: Error | unknown
): types.LoadFailedUserMetaStats => ({
  type: types.USER_LOAD_FAILED_META_STATS,
  payload: {
    username,
    error
  }
})

export const settingUserOptions = (
  username: Username,
  option: string,
  value: unknown
): types.SettingUserOptions => ({
  type: types.USER_SETTING_OPTIONS,
  payload: {
    username,
    option,
    value
  }
})

export const setUserOptions = (
  username: Username,
  option: string,
  value: unknown
): types.SetUserOptions => ({
  type: types.USER_SET_OPTIONS,
  payload: {
    username,
    option,
    value
  }
})

export const setFailedUserOptions = (
  username: Username,
  option: string,
  value: unknown,
  error: Error | unknown
): types.SetFailedUserOptions => ({
  type: types.USER_SET_OPTIONS_FAILED,
  payload: {
    username,
    option,
    value,
    error
  }
})
