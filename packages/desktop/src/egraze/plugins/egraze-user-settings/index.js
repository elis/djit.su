import { debounce } from 'lodash/fp'
import { loadUserSettings, saveUserSettings } from './localstorage'

export const name = 'user-settings'

export const main = {
  init: () => {
    const state = {}
    state.userSettings = loadUserSettings()

    const saveSettings = debounce(1000, () =>
      saveUserSettings(state.userSettings)
    )

    const api = {
      get: prop =>
        prop ? state.userSettings[prop] : { ...state.userSettings },
      set: (prop, value) => {
        state.userSettings[prop] = value
        saveSettings()
      }
    }

    return api
  }
}
