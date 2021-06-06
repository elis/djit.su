import { selector } from 'recoil'
import { systemState } from '../atoms/system'

export const systemStateData = selector({
  key: 'systemStateData',
  get: ({get}) => {
    const { serviceAttached, ...state} = get(systemState)

    return state
  }
})
