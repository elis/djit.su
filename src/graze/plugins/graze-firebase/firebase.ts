import * as firebase from 'firebase/app'
import { ssr } from 'djitsu/utils/ssr'

export const status: FirebaseService = {
  offline: true,
  services: {},
  apps: {}
}

export const defaultFirebaseServices: FirebaseServicesSelector = {
  analytics: !ssr,
  auth: !ssr,
  firestore: true,
  functions: !ssr,
  storage: !ssr
}

export const initialize = async (
  options: FirebaseOptions,
  services = defaultFirebaseServices,
  appName = '[DEFAULT]'
): Promise<FirebaseServices> => {
  const initialized: FirebaseServices = {}
  // Handle hot-reload code
  let aapp
  try {
    aapp = firebase.app()
  } catch (err) {
    // handle
  }

  // console.log(
  //   '🙅‍♀️🙅‍♂️⛔️🚫 OPTIONS INITIALIZE XXX',
  //   { options, services },
  //   status,
  //   status.apps,
  //   aapp,
  //   aapp && aapp?.name === appName
  // )

  if (status.apps[appName]) return status.apps[appName]
  status.apps[appName] = initialized

  if (!options.apiKey) throw new Error('Missing Firebase API Key')

  // firebase app
  initialized.app =
    aapp?.name === appName ? aapp : firebase.initializeApp(options, appName)

  // analytics
  if (!ssr && services.analytics) {
    await import('firebase/analytics')
    initialized.analytics = firebase.analytics()
  }

  // firestore
  if (services.firestore) {
    await import('firebase/firestore')

    initialized.firestore = firebase.firestore()

    if (services.enablePersistance) {
      try {
        await initialized.firestore.enablePersistence({
          synchronizeTabs: true
        })
        initialized.persistence = true
      } catch (err) {
        if (err.code == 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          // ...
        } else if (err.code == 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          // ...
        }
      }
    }
  }

  // auth
  if (services.auth) {
    await import('firebase/auth')
    initialized.auth = firebase.auth()
  }

  // storage
  if (services.storage) {
    await import('firebase/storage')
    initialized.storage = firebase.storage()
  }

  // functions
  if (services.functions) {
    await import('firebase/functions')
    initialized.functions = firebase.functions()
  }

  Object.assign(status, {
    offline: !!initialized.app,
    services: { ...initialize },
    apps: { [appName]: { ...initialized } }
  })

  return initialized
}

export default firebase

// * Types
//
// // // // // // // // // // // // // // // // // // // //
//

export interface FirebaseService {
  offline: boolean
  services: FirebaseServices
  apps: {
    [appName: string]: FirebaseServices
  }
}

export type FirebaseApp = firebase.app.App
export type Firebase = FirebaseApp

export interface FirebaseServices {
  app?: firebase.app.App
  analytics?: firebase.analytics.Analytics
  auth?: firebase.auth.Auth
  firestore?: firebase.firestore.Firestore
  functions?: firebase.functions.Functions
  storage?: firebase.storage.Storage
  persistence?: boolean
}

export interface FirebaseServicesSelector {
  analytics?: boolean
  auth?: boolean
  firestore?: boolean
  functions?: boolean
  storage?: boolean

  enablePersistance?: boolean
}

export interface FirebaseOptions {
  apiKey: string
  appId: string
  authDomain?: string
  databaseURL?: string
  messagingSenderId?: string
  projectId: string
  storageBucket?: string
}
