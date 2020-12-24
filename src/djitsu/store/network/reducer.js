import {
  NETWORK_REQUEST_START,
  NETWORK_REQUEST_COMPLETE,
  NETWORK_REQUEST_FAILED
} from './types'

const initialState = {
  serverUrl: '',
  openRequests: [],
  completeRequests: [],
  failedRequests: [],
  requests: []
}

export const networkReducer = (state = initialState, action) => {
  switch (action.type) {
    case NETWORK_REQUEST_START:
      return {
        ...state,
        openRequests: [...state.openRequests, action.payload.uuid],
        requests: [...state.requests, action.payload]
      }
    case NETWORK_REQUEST_COMPLETE:
      return {
        ...state,
        openRequests: [
          ...state.openRequests.filter((uuid) => uuid !== action.payload.uuid)
        ],
        completeRequests: [...state.completeRequests, action.payload.uuid],
        requests: [
          ...state.requests.filter(({ uuid }) => uuid !== action.payload.uuid),
          Object.assign(
            {},
            state.requests.find(({ uuid }) => uuid === action.payload.uuid),
            {
              response: action.payload.response,
              endTime: action.payload.time
            }
          )
        ]
      }

    case NETWORK_REQUEST_FAILED:
      return {
        ...state,
        openRequests: [
          ...state.openRequests.filter((uuid) => uuid !== action.payload.uuid)
        ],
        failedRequests: [...state.failedRequests, action.payload.uuid],
        requests: [
          ...state.requests.filter(({ uuid }) => uuid !== action.payload.uuid),
          Object.assign(
            {},
            state.requests.find(({ uuid }) => uuid === action.payload.uuid),
            {
              response: action.payload.response,
              endTime: action.payload.time,
              error: action.payload.error
            }
          )
        ]
      }

    default:
      return state
  }
}
