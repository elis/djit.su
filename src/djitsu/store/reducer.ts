// import { baseReducer } from './base/reducer'
import { userReducer } from './user/reducer'
// import { documentsReducer } from './documents/reducer'
import { authReducer } from './auth/reducer'
import { networkReducer } from './network/reducer'
import { systemReducer } from './system/reducer'
import { notebookReducer } from './notebook/reducer'

export const reducer = {
  network: networkReducer,
  system: systemReducer,
  auth: authReducer,
  user: userReducer,
  notebook: notebookReducer
  // base: baseReducer,
  // documents: documentsReducer
}

export default reducer
