import { AppThunk } from 'djitsu/store'
import { accountDisconnected } from '../actions'

export const userDisconnected = (): AppThunk => async (dispatch) => {
  dispatch(accountDisconnected())
  return true
}

export default userDisconnected
