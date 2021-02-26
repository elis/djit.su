import * as system from 'djitsu/schema/system'
import { DjitsuServices } from 'djitsu/schema/api'

export const INITIALIZED = 'system/initialized'
export const INITIALIZE_FAILED = 'system/initialize-failed'

export interface SystemInitialState {
  initialized: boolean
  environment: {
    env?: system.SystemEnvironment
  }
}

export interface SystemProperties {
  env: system.SystemEnvironment
}

export interface SystemInitializedAction {
  type: typeof INITIALIZED
  payload: {
    services: Partial<DjitsuServices>
  }
}

export interface SystemInitializeFailedAction {
  type: typeof INITIALIZE_FAILED
  payload: {
    error: system.SystemError
  }
}

export type SystemAction =
  | SystemInitializedAction
  | SystemInitializeFailedAction
