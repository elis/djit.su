export type BootupData = {
  staticPath: string
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
