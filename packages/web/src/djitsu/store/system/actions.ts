import * as system from './types'
import { SystemErrorCode, SystemError } from 'djitsu/schema/system'
import { DjitsuServices } from 'djitsu/schema/api'

// * Thunks
//
// // // // // // // // // // // // // // // // // // // // //
//

export { initializeSystem } from './thunks/initialize-system'

// * Dispatchables
//
// // // // // // // // // // // // // // // // // // // // //
//

export const systemInitializedAction = (
  services: Partial<DjitsuServices>
): system.SystemInitializedAction => ({
  type: system.INITIALIZED,
  payload: {
    services
  }
})

export const systemInitializeFailedAction = (
  code: SystemErrorCode,
  error: typeof Error
): system.SystemInitializeFailedAction => ({
  type: system.INITIALIZE_FAILED,
  payload: {
    error: { code, Error: error } as SystemError
  }
})
