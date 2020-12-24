import {
  UserID,
  UserMetaStats,
  Username,
  UserOptions,
  UserProfile,
  UserProfileMeta
} from 'djitsu/schema/user'

export const USER_INIT_AUTHENTICATED = 'user/initialize-authenticated'
export const USER_CREATING_ACCOUNT = 'user/creating-user-account'
export const USER_ACCOUNT_CREATED = 'user/user-account-created'
export const USER_ACCOUNT_AUTHENTICATED = 'user/user-account-authenticated'
export const USER_ACCOUNT_AUTHENTICATION_FAILED =
  'user/user-account-authentication-failed'
export const USER_ACCOUNT_DISCONNECTED = 'user/user-account-disconnected'
export const USER_ACCOUNT_SEEDING = 'user/user-account-seeding'
export const USER_ACCOUNT_SEEDED = 'user/user-account-seeded'
export const USER_LOADING_PROFILE = 'user/user-loading-profile'
export const USER_LOADED_PROFILE = 'user/user-loaded-profile'
export const USER_LOAD_FAILED_PROFILE = 'user/user-load-failed-profile'
export const USER_LOADING_META_STATS = 'user/user-loading-meta-stats'
export const USER_LOADED_META_STATS = 'user/user-loaded-meta-stats'
export const USER_LOAD_FAILED_META_STATS = 'user/user-load-failed-meta-stats'
export const USER_SETTING_OPTIONS = 'user/user-setting-options'
export const USER_SET_OPTIONS = 'user/user-set-options'
export const USER_SET_OPTIONS_FAILED = 'user/user-set-options-failed'

export interface UserInitialState {
  initiailized: boolean
  authenticatedUserID?: UserID
  username?: Username
  profiles?: Record<Username, Partial<UsersProfile>>
  options?: Partial<UserOptions>
  error?: Error | unknown
}

export interface UsersProfile {
  meta: Partial<UserProfileMeta>
  profile: Partial<UserProfile>
  stats: Partial<UserMetaStats>
}

export interface InitializeAuthenticated {
  type: typeof USER_INIT_AUTHENTICATED
  payload: {
    uid: UserID
  }
}

export interface CreatingUser {
  type: typeof USER_CREATING_ACCOUNT
  payload: {
    uid: UserID
    username: Username
  }
}

export interface UserCreated {
  type: typeof USER_ACCOUNT_CREATED
  payload: {
    uid: UserID
    username: Username
  }
}

export interface AccountAuthenticated {
  type: typeof USER_ACCOUNT_AUTHENTICATED
  payload: {
    uid: UserID
    username: Username
    options?: UserOptions
  }
}

export interface AccountAuthenticationFailed {
  type: typeof USER_ACCOUNT_AUTHENTICATION_FAILED
  payload: {
    uid: UserID
    error: Error | unknown
  }
}

export interface AccountDisconnected {
  type: typeof USER_ACCOUNT_DISCONNECTED
}

export interface AccountSeeding {
  type: typeof USER_ACCOUNT_SEEDING
  payload: {
    username: Username
  }
}

export interface AccountSeeded {
  type: typeof USER_ACCOUNT_SEEDED
  payload: {
    username: Username
  }
}

export interface LoadingUserProfile {
  type: typeof USER_LOADING_PROFILE
  payload: {
    username: Username
  }
}

export interface LoadedUserProfile {
  type: typeof USER_LOADED_PROFILE
  payload: {
    username: Username
    profile: Partial<UserProfile>
  }
}

export interface LoadFailedUserProfile {
  type: typeof USER_LOAD_FAILED_PROFILE
  payload: {
    username: Username
    error: Error | unknown
  }
}

export interface LoadingUserMetaStats {
  type: typeof USER_LOADING_META_STATS
  payload: {
    username: Username
  }
}

export interface LoadedUserMetaStats {
  type: typeof USER_LOADED_META_STATS
  payload: {
    username: Username
    stats: Partial<UserMetaStats>
  }
}

export interface LoadFailedUserMetaStats {
  type: typeof USER_LOAD_FAILED_META_STATS
  payload: {
    username: Username
    error: Error | unknown
  }
}

export interface SettingUserOptions {
  type: typeof USER_SETTING_OPTIONS
  payload: {
    username: Username
    option: string
    value: unknown
  }
}

export interface SetUserOptions {
  type: typeof USER_SET_OPTIONS
  payload: {
    username: Username
    option: string
    value: unknown
  }
}

export interface SetFailedUserOptions {
  type: typeof USER_SET_OPTIONS_FAILED
  payload: {
    username: Username
    option: string
    value: unknown
    error: Error | unknown
  }
}

export type UserAction =
  | InitializeAuthenticated
  | CreatingUser
  | UserCreated
  | AccountAuthenticated
  | AccountAuthenticationFailed
  | AccountDisconnected
  | AccountSeeding
  | AccountSeeded
  | LoadingUserProfile
  | LoadedUserProfile
  | LoadFailedUserProfile
  | LoadingUserMetaStats
  | LoadedUserMetaStats
  | LoadFailedUserMetaStats
  | SettingUserOptions
  | SetUserOptions
  | SetFailedUserOptions
