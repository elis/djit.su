import { AppThunk } from 'djitsu/store'
import {
  systemInitializeFailedAction,
  systemInitializedAction
} from '../actions'
import { SystemErrorCode } from 'djitsu/schema/system'
import { SupportedFeatures } from 'djitsu/schema/api'

export const initializeSystem = (
  dv: string,
  options: Record<string, unknown>,
  services: SupportedFeatures
): AppThunk => async (dispatch, _getState, api): Promise<boolean> => {
  console.log('[ ⟑ ]', 'Initializing system...', dv)
  const djitsu = api.djitsu

  try {
    const result = await djitsu.initialize(dv, options, services)
    console.log('[ ⟑ ]', 'System ready')
    dispatch(systemInitializedAction(result))
    return true
  } catch (err) {
    console.log('_____ UNHANDLED ERROR SYSTEM INIT ______')
    console.log('err:', err)

    dispatch(systemInitializeFailedAction(SystemErrorCode.InitFailed, err))
  }

  return false
}
