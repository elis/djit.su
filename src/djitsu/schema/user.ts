import { Timestamp } from './generics'
import { AuthProvider } from './auth'

export interface UserService {
  getProfile: (username: Username) => Promise<Partial<User>>
  getMetaStats: (username: Username) => Promise<Partial<UserMetaStats>>
  checkUsername: (username: Username) => Promise<boolean>
  registerUsername: (uid: UserID, username: Username) => Promise<boolean>
  getUsers: (query: string) => Promise<Partial<User>[]>
  loadAuthenticated: (uid: UserID) => Promise<AccountData>
  createUser: (uid: UserID, username: Username) => Promise<AccountData>
  setOptions: (
    username: Username,
    option: string,
    value: unknown
  ) => Promise<void>
}

//
//
// * User
// // // // // // // // // // // // // // //
//

export interface User {
  uid: UserID
  username: Username

  role: UserRole

  displayName: string
  photoUrl: string
  email: string

  options: UserOptions
  meta: UserMetaStats
}

export type UserID = string
export type Username = string

export enum UserRole {
  Anonymous = 'anonymous',
  Nameless = 'nameless', // User registered through email / google
  User = 'user',
  Admin = 'admin',
  GM = 'gm'
}

export interface UserMeta {
  created: Timestamp // When user signed up for UID
  claimed: Timestamp // When user registered username

  lastOnline: Timestamp

  providers: AuthProvider[] // Array so user can associate more than one google account
}

export enum UserOption {
  ThemeActivation = 'theme-activation'
}

export interface UserOptions {
  [UserOption.ThemeActivation]: boolean
}

// * User Profile
// // // // // // // // // // // // // // //
//
//
//

export interface UserProfile {
  email: string
  displayName: string
  url: string
  title: string
  description: string
  photoUrl: string
  stats: UserMetaStats
}

export interface UserProfileMeta {
  loading?: boolean
  loaded?: boolean
  updated?: Timestamp
  error?: Error | unknown
}

// * User Statistics
// // // // // // // // // // // // // // //
//
//
//

export interface UserStatistics {
  inbound: {
    apps: AppStats
    documents: InboundDocumentStats
    user: InboundUserStats
  }
  outbound: {
    apps: AppStats
    documents: OutboundDocumentStats
    users: OutboundUserStats
  }
}

interface AppStats {
  likes: number
  favorites: number
  downloads: number // download executable
  installs: number // install on platform (mobile/chrome/os)
  runs: number // run app
  views: number // viewed app page
  portaled: number // used as part of another app
  portals: number // # other apps using app
}

interface InboundDocumentStats {
  forks: number
  imports: number // #docs direct `import` in documents
  includes: number // #docs indirect imports by dependencies
  likes: number
  star: number
}

interface OutboundDocumentStats {
  forks: number
  imports: number // #docs direct `import` in documents
  includes: number // #docs indirect imports by dependencies
  likes: number
  star: number
  versions: number // # published versions
  deleted: number
  saves: number // # of times saved a document
  blocks: number // # blocks created
  created: number
  imported: number
  shared: number
  published: number
}

interface InboundUserStats {
  followers: number
  stars: number
  mentions: number
}

interface OutboundUserStats {
  follows: number
  stars: number
}

export enum UserError {
  NO_ACCOUNT = 'No such account',
  NO_USERNAME = 'No such username',
  NO_USER_DOCUMENT = 'No user document'
}

export interface AccountData {
  username: Username
  created: firebase.firestore.FieldValue
  lastSeen: firebase.firestore.FieldValue
  options: UserOptions
}

export type UserMetaStats = Record<UserMetaStat, number>

export enum UserMetaStat {
  Notebooks = 'notebooks',
  NotebookRevisions = 'revisions',
  NoteboookVersions = 'versions',
  NotebookFork = 'notebook-fork',
  NotebookForRevisions = 'notebook-fork-revisions',
  NotebookForVersions = 'notebook-fork-versions',
  NotebookForks = 'notebook-forks',
  NotebookLike = 'notebook-like',
  NotebookStar = 'notebook-star',
  PublicNotebooks = 'public',
  PublishedNotebooks = 'published',
  Star = 'star',
  Like = 'like',
  UserForked = 'user-fork',
  UserLiked = 'user-like',
  UserStarred = 'user-star'
}

/*

  accounts/{uid}
    // -> users = ['usernameA', 'usernameB']
    => /users/{username}
      -> role: 'creator'
    => /providers/{provider}
      -> created: timestamp

*/
