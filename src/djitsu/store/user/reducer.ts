import * as user from './types'

const initialState: user.UserInitialState = {
  initiailized: false
}

export const userReducer = (
  state = initialState,
  action: user.UserAction
): user.UserInitialState => {
  switch (action.type) {
    case user.USER_INIT_AUTHENTICATED:
      return {
        ...state,
        authenticatedUserID: action.payload.uid
      }
    case user.USER_ACCOUNT_AUTHENTICATED:
      return {
        ...state,
        initiailized: true,
        username: action.payload.username,
        options: action.payload.options || {}
      }
    case user.USER_ACCOUNT_AUTHENTICATION_FAILED:
      return {
        ...state,
        initiailized: true,
        error: action.payload.error
      }
    case user.USER_ACCOUNT_DISCONNECTED:
      return {
        ...state,
        username: undefined,
        authenticatedUserID: undefined,
        initiailized: true
      }
    case user.USER_LOADING_PROFILE:
      return {
        ...state,
        profiles: {
          ...(state.profiles || {}),
          [action.payload.username]: {
            ...(state.profiles?.[action.payload.username] || {}),
            meta: {
              ...(state.profiles?.[action.payload.username]?.meta || {}),
              loading: true,
              error: undefined
            }
          }
        }
      }
    case user.USER_LOADED_PROFILE:
      return {
        ...state,
        profiles: {
          ...(state.profiles || {}),
          [action.payload.username]: {
            ...(state.profiles?.[action.payload.username] || {}),
            meta: {
              ...(state.profiles?.[action.payload.username]?.meta || {}),
              loading: false
            },
            profile: action.payload.profile
          }
        }
      }
    case user.USER_LOAD_FAILED_PROFILE:
      return {
        ...state,
        profiles: {
          ...(state.profiles || {}),
          [action.payload.username]: {
            ...(state.profiles?.[action.payload.username] || {}),
            meta: {
              ...(state.profiles?.[action.payload.username]?.meta || {}),
              loading: false,
              error: action.payload.error
            }
          }
        }
      }
    case user.USER_LOADED_META_STATS:
      return {
        ...state,
        profiles: {
          ...(state.profiles || {}),
          [action.payload.username]: {
            ...(state.profiles?.[action.payload.username] || {}),
            stats: action.payload.stats
          }
        }
      }
    case user.USER_SET_OPTIONS:
      return {
        ...state,
        options: {
          ...(state.options || {}),
          [action.payload.option]: action.payload.value
        }
      }
    default:
      return state
  }
}
