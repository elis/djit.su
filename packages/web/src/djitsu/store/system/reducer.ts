import * as system from './types'

const initialState: system.SystemInitialState = {
  initialized: false,
  environment: {}
}

export const systemReducer = (
  state = initialState,
  action: system.SystemAction
): system.SystemInitialState => {
  switch (action.type) {
    case system.INITIALIZED:
      return {
        ...state,
        initialized: true
      }
    case system.INITIALIZE_FAILED:
      return {
        ...state,
        initialized: false
      }
    default:
      return state
  }
}
