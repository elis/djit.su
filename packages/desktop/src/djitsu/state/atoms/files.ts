import { atomFamily, selectorFamily } from 'recoil'
import { plugin } from '../../../egraze'
import { File } from '../../schema/files'

export const file = atomFamily({
  key: 'fileSthing',
  default: selectorFamily({
    key: 'file/Default',
    get: filepath => async () => {
      const fsp = plugin('file-system')
      const retfile = {
        path: filepath
      } as File

      if (filepath) {
        const filedata = await fsp.readFile(filepath)

        return filedata
      }

      return retfile
    }
  })
})
