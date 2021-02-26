import { User, UserID } from './user'
import { Timestamp } from './generics'
import { UserInfo } from 'firebase'

export interface AuthService {
  onAuthStateChanged: (
    listener: AuthStateListener
  ) => AuthStateListenerUnsubscribe

  signinWithPassword: (
    identifier: string,
    password: string,
    remember: boolean
  ) => Promise<Partial<User>>

  signinWithProvider: (
    provider: ProviderID,
    providerOptions: Record<string, unknown>
  ) => Promise<Partial<User>>

  signOut: () => Promise<void>

  createEmailAccount: (
    email: string,
    password: string,
    remember: boolean
  ) => Promise<AuthCredential>
}

// export interface SigninResult {
//   uid: UserID
//   additionalUserInfo?: AdditionalUserInfo
//   user: firebase.User
// }

// export interface AdditionalUserInfo {
//   isNewUser: boolean
//   profile: Record<string, unknown> | null
//   providerId: string
//   username?: string | null | undefined
// }

export interface AuthCredential {
  uid: UserID
  user: AuthUser
  provider: AuthProvider
}

export interface AuthUser {
  uid: UserID
  displayName: string
  email: string
  emailVerified: boolean
  isAnonymous: boolean
  photoURL: string
  providerId: ProviderID
  providerData: UserInfo[]
}

// returnResult.user.uid
// returnResult.user.displayName
// returnResult.user.email
// returnResult.user.emailVerified
// returnResult.user.isAnonymous
// returnResult.user.metadata.creationTime
// returnResult.user.metadata.lastSignInTime
// returnResult.user.photoURL
// // returnResult.user.providerData...
// returnResult.user.providerId

//
//
// * Auth Providers
// // // // // // // // // // // // // // //
//

export interface AuthProvider {
  provider: ProviderID
  profile: ProviderProfile
  inNewUser: boolean // User registered with this provider
}

export enum ProviderID {
  password = 'password',
  google = 'google.com',
  github = 'github.com'
}

export type ProviderProfile =
  | PasswordProvider
  | EmailProviderProfile
  | SocialProvidersProfile

interface PasswordProvider {
  created: Timestamp
}

interface EmailProviderProfile {
  email: string
  verified_email: boolean
}

// * Social Providers
// // // // // // // // // // // // // // //
//
//
//

type SocialProvidersProfile = GoogleProviderProfile | GithubProviderProfile

interface GoogleProviderProfile {
  name: string
  verified_email: boolean
  given_name: string
  family_name: string
  email: string
  picture: string
}

interface GithubProviderProfile {
  login: string
  blog: string
  updated_at: string
  company: string
  public_repos: number
  email: string
  url: string
  followers: number
  avatar_url: string
  html_url: string
  name: string
  location: string
  [name: string]: unknown
}

export type AuthStateListenerUnsubscribe = () => void
export type AuthStateListener = (user: AuthUser) => void
