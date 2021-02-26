import graze from 'graze'
import {
  AuthService,
  AuthCredential,
  AuthProvider,
  ProviderProfile,
  ProviderID,
  AuthStateListener,
  AuthStateListenerUnsubscribe
} from 'djitsu/schema/auth'
import firebase from 'firebase'

export const auth: AuthService = {
  onAuthStateChanged: (listener) => {
    const fbAuth = graze.exposed.firebase.auth

    const outerListener: AuthStateListener = (user) => {
      listener(user)
    }
    const unsubscribe = fbAuth.onAuthStateChanged(
      outerListener
    ) as AuthStateListenerUnsubscribe

    return unsubscribe
  },
  signinWithPassword: async (email, password, remember) => {
    const fbAuth = graze.exposed.firebase.auth

    // Handle persistance
    await fbAuth.setPersistence(
      firebase.auth.Auth.Persistence[remember ? 'LOCAL' : 'SESSION']
    )

    const signinResult = await fbAuth.signInWithEmailAndPassword(
      email,
      password
    )

    return signinResult
  },
  signinWithProvider: async (provider, options) => {
    const fbAuth = graze.exposed.firebase.auth

    let Provider
    if (provider === ProviderID.google) {
      Provider = new firebase.auth.GoogleAuthProvider()
      Provider.addScope('email')
    } else if (provider === ProviderID.github) {
      Provider = new firebase.auth.GithubAuthProvider()
      Provider.addScope('read:user')
    } else {
      throw new Error('Unsupported provider')
    }

    const { remember } = options
    // Handle persistance
    await fbAuth.setPersistence(
      firebase.auth.Auth.Persistence[remember ? 'LOCAL' : 'SESSION']
    )
    const signinResult = await fbAuth.signInWithPopup(Provider)
    return signinResult
  },
  createEmailAccount: async (email, password, remember) => {
    const fbAuth = graze.exposed.firebase.auth

    // Handle persistance
    await fbAuth.setPersistence(
      firebase.auth.Auth.Persistence[remember ? 'LOCAL' : 'SESSION']
    )

    const signupResult = (await fbAuth.createUserWithEmailAndPassword(
      email,
      password
    )) as firebase.auth.UserCredential

    if (!signupResult.user) {
      throw new Error('Operation failed.')
    }

    const profile = signupResult.additionalUserInfo?.profile as ProviderProfile

    const provider = {
      provider: signupResult.additionalUserInfo?.providerId as ProviderID,
      profile,
      inNewUser: signupResult.additionalUserInfo?.isNewUser ?? false
    } as AuthProvider

    const returnResult = {
      uid: signupResult.user.uid,
      user: signupResult.user.toJSON(),
      provider
    } as AuthCredential

    return returnResult
  },
  signOut: () => {
    const fbAuth = graze.exposed.firebase.auth
    return fbAuth.signOut()
  }
}
