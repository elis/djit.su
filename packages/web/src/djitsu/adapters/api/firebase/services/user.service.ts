import {
  User,
  UserProfile,
  UserService,
  UserError,
  AccountData,
  UserMetaStats
} from 'djitsu/schema/user'
import graze from 'graze'
import dv from 'djitsu/utils/database-version'
import firebase from 'firebase'

export const user: UserService = {
  checkUsername: async (username: string): Promise<boolean> => {
    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)

    const usernameRef = dvRef.collection('usernames').doc(username)
    const usernameDoc = await usernameRef.get()

    return !usernameDoc.exists
  },
  getProfile: async (username: string): Promise<Partial<UserProfile>> => {
    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)

    const userProfileRef = dvRef
      .collection('users')
      .doc(username)
      .collection('public')
      .doc('profile')
    const userProfileDoc = await userProfileRef.get()
    const userProfileData: UserProfile = userProfileDoc.data()

    return userProfileData
  },
  getMetaStats: async (username: string): Promise<Partial<UserMetaStats>> => {
    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)

    const userStatsRef = dvRef
      .collection('users')
      .doc(username)
      .collection('meta')
      .doc('stats')
    const userStatsDoc = await userStatsRef.get()
    const userStatsData: UserMetaStats = userStatsDoc.data()

    return userStatsData
  },
  registerUsername: async (uid: string, username: string): Promise<boolean> => {
    const functions = graze.exposed.firebase.functions

    const registerUsername = functions.httpsCallable('registerUsername')
    const result = await registerUsername({ uid, username })

    return !!result
  },
  getUsers: async (query: string): Promise<Partial<User>[]> => {
    if (!query) {
      return []
    }

    return []
  },
  createUser: async (uid, username) => {
    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)
    const accountRef = dvRef.collection('accounts').doc(uid)
    const userRef = dvRef.collection('users').doc(username)
    const usernameRef = dvRef.collection('usernames').doc(username)

    const postData = {
      username,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    }

    await accountRef.set(postData)

    const makeData = {
      uid,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    }
    await userRef.set(makeData)

    const usernamePostData = {
      claimedOn: firebase.firestore.FieldValue.serverTimestamp()
    }
    await usernameRef.set(usernamePostData)

    const resultDoc = await accountRef.get()
    const resultData = resultDoc.data()

    return resultData as AccountData
  },
  loadAuthenticated: async (uid) => {
    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)

    const accountRef = dvRef.collection('accounts').doc(uid)
    const accountDoc = await accountRef.get()

    if (!accountDoc.exists) {
      throw new Error(UserError.NO_ACCOUNT)
    }
    const accountData = accountDoc.data()

    const userRef = dvRef.collection('users').doc(accountData.username)
    const userDoc = await userRef.get()

    if (!userDoc.exists) throw new Error(UserError.NO_USER_DOCUMENT)

    const userData = userDoc.data()

    const user = {
      ...accountData,
      ...userData
    }

    return user
  },
  setOptions: async (username, option, value) => {
    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)

    const userRef = dvRef.collection('users').doc(username)

    const userDoc = await userRef.get()
    if (!userDoc.exists) throw new Error(UserError.NO_USERNAME)
    const userData = userDoc.data()
    await userRef.set(
      {
        options: {
          ...(userData.options || {}),
          [option]: !value ? !!value : value
        }
      },
      { merge: true }
    )
  }
}
