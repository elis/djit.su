import { atom, atomFamily } from 'recoil'
import {
  SystemCommand,
  SystemLoading,
  SystemState,
  SystemStatus
} from '../../schema/system'

export const systemState = atom({
  key: 'systemState',
  default: {
    serviceAttached: false,
    status: SystemStatus.Unavailable,
    staticPath: ''
  } as SystemState
})

export const bootError = atom({
  key: 'bootError',
  default: null
})

export const systemCommand = atom({
  key: 'systemCommand',
  default: null as SystemCommand
})

export const systemLoading = atom({
  key: 'systemLoading',
  default: null as SystemLoading
})

export const loadingStatus = atomFamily({
  key: 'loadingStatus',
  default: null as SystemLoading
})
