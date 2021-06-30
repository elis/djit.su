import { atom } from "recoil"

export const layoutState = atom({
  key: "layoutState",
  default: {
    sidebar: true,
    breadcrumbs: true,
    noPadding: false
  },
})
