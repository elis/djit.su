import {
  NETWORK_REQUEST_START,
  NETWORK_REQUEST_COMPLETE,
  NETWORK_REQUEST_FAILED
} from './types'

export const actionRequestStart = (method, path, body) => ({
  type: NETWORK_REQUEST_START,
  payload: {
    method,
    path,
    body,
    time: Date.now(),
    uuid: Math.floor(Math.random() * Math.pow(10, 16)).toString(24)
  }
})
export const actionRequestComplete = (uuid, response) => ({
  type: NETWORK_REQUEST_COMPLETE,
  payload: {
    response,
    uuid,
    time: Date.now()
  }
})
export const actionRequestFailed = (uuid, response, error) => ({
  type: NETWORK_REQUEST_FAILED,
  payload: {
    response,
    uuid,
    error,
    time: Date.now()
  }
})

export const startRequest = (method, path, body) => async (dispatch) =>
  dispatch(actionRequestStart(method, path, body))
