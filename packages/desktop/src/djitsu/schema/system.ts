export type BootupData = {
  staticPath: string
  local: {
    options?: Record<string, unknown>
    third?: {
      path: string
    }
    ready?: {
      info: Record<string, unknown>
    }
    action?: string
    payload?: Record<string, unknown>
  }
}

export type SystemState = {
  status: SystemStatus
  staticPath: string
  serviceAttached: boolean
  windowId: string
}

export enum SystemStatus {
  Booting = 'booting',
  Error = 'error',
  Ready = 'ready',
  Unavailable = 'unavaiable'
}

export type SystemCommand = OpenFileSystemCommand | GenericSystemCommand | null

export type GenericSystemCommand = {
  action: string
  payload?: {
    [key: string]: unknown
  }
}

export type OpenFileSystemCommand = {
  action: 'open-file'
  payload: {
    path: string
  }
}

export type SystemLoading =
  | {
      message?: string | React.ReactElement
      Message?: (props: Record<string, unknown>) => React.ReactElement
      start?: number
      spinner?: SystemSpinner
    }
  | false
  | null

export enum SystemSpinner {
  Impulse = 'impulse',
  Rotate = 'rotate'
}
