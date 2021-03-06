export type BootupData = {
  staticPath: string
  options?: Record<string, unknown>,
  third?: {
    path: string
  },
  ready?: {
    info: Record<string, unknown>
  }
}

export type SystemState = {
  status: SystemStatus
  staticPath: string
  serviceAttached: boolean
}

export enum SystemStatus {
  Booting = 'booting',
  Error = 'error',
  Ready = 'ready',
  Unavailable = 'unavaiable'
}

export type SystemCommand = {
  action: string
  [key: string]: unknown
} | null

export type SystemLoading = {
  message?: string
  Message?: (props: any) => React.ReactElement
  start?: number
  spinner?: SystemSpinner
} | false | null

export enum SystemSpinner {
  Impulse = 'impulse',
  Rotate = 'rotate'
}
