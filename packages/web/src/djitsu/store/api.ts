import * as networkService from 'djitsu/services/network'
import * as firebaseApiAdapter from 'djitsu/adapters/api/firebase'
import firebaseService, { initialize } from 'djitsu/services/firebase'
import { DjitsuAPI } from 'djitsu/schema/api'

type Firebase = typeof firebaseService
export type FirebaseAPI = Firebase

const fbs = {
  initialize,
  ...firebaseService
}

interface ExtendedFirebase extends Firebase {
  initialize: typeof initialize
}

const StoreAPI: StoreAPI = {
  network: networkService as NetworkAPI,
  firebase: fbs as ExtendedFirebase,
  djitsu: firebaseApiAdapter
}
export interface NetworkAPI {
  post: typeof networkService.post
  get: typeof networkService.get
}

export interface StoreAPI {
  network: NetworkAPI
  firebase: ExtendedFirebase
  djitsu: DjitsuAPI
}
export type API = StoreAPI

export default StoreAPI
