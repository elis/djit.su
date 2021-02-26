export interface SystemError {
  code?: SystemErrorCode
  message?: string
  Error?: typeof Error
}

export type SystemEnvironment =
  | 'prod' // djit.su
  | 'stage'
  | 'test' // test.djit.su
  | 'dev' // localhost
  | 'custom'

export enum SystemErrorCode {
  NoNetwork = 'no-network',
  InitFailed = 'init-failed'
}
