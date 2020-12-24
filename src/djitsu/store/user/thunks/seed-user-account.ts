import { AppThunk } from 'djitsu/store'
import { Username } from 'djitsu/schema/user'
import { seedingAccount, accountSeeded } from '../actions'

export const seedUserAccount = (username: Username): AppThunk => async (
  dispatch
) => {
  // if (!djitsu.user) throw new Error('User service is not available')
  dispatch(seedingAccount(username))

  // await djitsu.user.seedAccount(username, {})
  dispatch(accountSeeded(username))
}

export default seedUserAccount
