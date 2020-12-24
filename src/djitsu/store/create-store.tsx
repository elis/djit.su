import { combineReducers, createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
// import { persistStore, persistReducer } from 'redux-persist'
// import storage from 'redux-persist/lib/storage'

import reducer from 'djitsu/store/reducer'
import api from 'djitsu/store/api'
const { BUILD_TARGET } = process.env

export const rootReducer = combineReducers(reducer)
// const persistedReducer = persistReducer(persistConfig, rootReducer)
const composeEnhancers =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (BUILD_TARGET !== 'server' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose

export const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunkMiddleware.withExtraArgument(api)))
)

export default store
