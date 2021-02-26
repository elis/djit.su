import { atom } from "recoil"

export const systemState = atom({
  key: "systemState",
  default: {
    booted: false,
    static: ''
  },
})
