import { atom, atomFamily } from 'recoil'
import { DjotEditorState, DjotStatus } from '../../schema/djot'

export const djotEditor = atomFamily({
  key: 'djotEditor',
  default: { } as DjotEditorState
})

export const currentDjotId = atom({
  key: 'currentDjotId',
  default: null
})
