import { atom } from "recoil"
import { SystemState, SystemStatus } from "../../schema/system"

export const systemState = atom({
  key: "systemState",
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
