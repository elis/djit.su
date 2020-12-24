import { AppThunk } from 'djitsu/store'
import { AuthCredential } from 'djitsu/schema/auth'
import { signedIn } from '../actions'

export const handleUserSignin = (
  credential: Partial<AuthCredential>
): AppThunk => async (dispatch) => {
  dispatch(signedIn(credential))
}

export default handleUserSignin
