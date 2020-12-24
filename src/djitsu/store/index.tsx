import React from 'react'
import { Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import {
  Provider,
  useDispatch,
  useSelector as useReduxSelector,
  TypedUseSelectorHook
} from 'react-redux'
import store, { rootReducer } from './create-store'

import { StoreAPI } from 'djitsu/store/api'

export interface StoreWrapperProps {
  children: React.ReactNode
}
export const StoreWrapper: React.FC<StoreWrapperProps> = ({
  children
}: StoreWrapperProps) => {
  return <Provider store={store}>{children}</Provider>
}

export default store

type ActionValues = unknown[]
interface Dispatcher {
  [name: string]: (...values: ActionValues) => unknown
}

type Dispatchable<T extends Dispatcher> = {
  [K in keyof T]: (...values: Parameters<T[K]>) => unknown
}

type Dispatched<T extends Dispatcher> = {
  [K in keyof T]: (...values: ActionValues) => unknown
}

export const useDispatcher = <T extends Dispatcher>(
  fns: T
): Dispatchable<T> => {
  const dispatch = useDispatch()
  const dispatched = Object.keys(fns).reduce((result, name) => {
    const executable = fns[name]
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const action = (...values: Parameters<typeof executable>) => {
      return dispatch(executable(...values))
    }

    return {
      ...result,
      [name]: action as typeof executable
    }
  }, {} as Dispatched<T>)

  return dispatched
}

export type RootState = ReturnType<typeof rootReducer>

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  StoreAPI,
  Action<string>
>

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector
