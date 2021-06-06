import { atom, atomFamily, selectorFamily } from 'recoil'
import { DjotEditorState, DjotStatus } from '../../schema/djot'
import { File } from '../../schema/files'
import useIPCRenderer from '../../services/ipc/renderer'
import { systemState } from './system'

export const file = atomFamily({
  key: 'fileSthing',
  default: selectorFamily({
    key: 'file/Default',
    get: (filepath) => async ({get}) => {
      const { invoke } = useIPCRenderer()
      console.log('getting file', filepath)
      const state = get(systemState)
      const retfile = {
        path: filepath,
      } as File
      console.log('system state', state)

      if (filepath) {
        const filedata = retfile.contents = await invoke('read-file', filepath)
        console.log('file data:', filedata)

        return filedata
      }

      return retfile
    }
  })


})
