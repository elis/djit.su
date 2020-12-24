import { getServerBasePath } from './environment'

import {
  actionRequestStart,
  actionRequestComplete
} from 'djitsu/store/network/actions'
import {
  RequestPath,
  RequestBody,
  onRequestSuccess,
  onRequestError,
  onRequestDenied,
  NetworkResponse,
  NetworkError
} from './network.types'

import store from 'djitsu/store'

const apiUrl = getServerBasePath()

const getConfig = (): RequestInit => {
  const config = {
    headers: {},
    credentials: 'include'
    // withCredentials: isOffline ? false : true
  } as RequestInit

  return config
}

export const post = async (
  uri: RequestPath,
  body?: RequestBody,
  onSuccess?: onRequestSuccess,
  onError?: onRequestError,
  onDenied?: onRequestDenied
): Promise<NetworkResponse> => {
  const config = getConfig()
  // const state = store.getState()
  // const currentAccount = state?.user?.currentAccount
  const request = {
    ...config,
    method: 'POST',
    path: uri,
    body: JSON.stringify(body),
    headers: new Headers({
      'content-type': 'application/json',
      ...config.headers
    })
  }

  const { dispatch } = store

  const {
    payload: { uuid }
  } = dispatch(actionRequestStart('POST', uri, body))

  const response = await fetch(request.path, request)
  dispatch(actionRequestComplete(uuid, response))
  if (onSuccess) onSuccess(response)
  if (!response.ok && response) {
    const error = {
      message: await response.text(),
      code: response.status
    } as NetworkError
    if (error.code === 403 && onError && onDenied) onDenied(error)
    if (onError) onError(error)
    return { error, response }
  }
  return { error: null, response }
}

export const postApi = async (
  path: RequestPath,
  body?: RequestBody,
  onSuccess?: onRequestSuccess,
  onError?: onRequestError,
  onDenied?: onRequestDenied
): Promise<NetworkResponse> => {
  const config = getConfig()
  const currentAccount = 'n/a' // state?.user?.currentAccount
  const request = {
    ...config,
    method: 'POST',
    path: `${apiUrl}/${path.replace(/^\//, '')}`,
    body: JSON.stringify(body),
    headers: new Headers({
      'content-type': 'application/json',
      ...config.headers,
      accuid: `${currentAccount}`
    })
  }

  const { dispatch } = store

  const {
    payload: { uuid }
  } = dispatch(actionRequestStart('POST', path, body))

  const response = await fetch(request.path, request)
  dispatch(actionRequestComplete(uuid, response))
  if (onSuccess) onSuccess(response)
  if (!response.ok && response) {
    const error = {
      message: await response.text(),
      code: response.status
    } as NetworkError
    if (error.code === 403 && onError && onDenied) onDenied(error)
    if (onError) onError(error)
    return { error, response }
  }
  return { error: null, response }
}

export const get = async (
  path: RequestPath,
  onSuccess?: onRequestSuccess,
  onError?: onRequestError,
  onDenied?: onRequestDenied
): Promise<NetworkResponse> => {
  const config = getConfig()

  const currentAccount = 'n/a' // state?.user?.currentAccount

  const request = {
    ...config,
    path: `${apiUrl}/${path.replace(/^\//, '')}`,
    headers: new Headers({
      ...config.headers,
      accuid: `${currentAccount}`
    })
  }

  const { dispatch } = store

  const {
    payload: { uuid }
  } = dispatch(actionRequestStart('GET', path))

  const response = await fetch(request.path, request)
  dispatch(actionRequestComplete(uuid, response))
  if (onSuccess) onSuccess(response)
  if (!response.ok && response) {
    const error = {
      message: await response.text(),
      code: response.status
    } as NetworkError
    if (error.code === 403 && onError && onDenied) onDenied(error)
    if (onError) onError(error)
    return { error, response }
  }
  return { error: null, response }
}

export default { get, post, postApi }
