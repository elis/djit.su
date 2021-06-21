import { promises } from 'fs'
import path from 'path'
import { plugin } from '../..'
import bindLocalFilesystem from './host-filesystem'

export const name = 'filesystem'

const { readFile } = promises

/** @type {import('../../egraze-plugins').MainPlugin} */
export const main = {
  init: () => {
    const fsConfig = [
      {
        type: 'os',
        basepath: '/',
        options: {
          readOnly: false
        }
      }
    ]

    const apis = fsConfig.reduce(
      (acc, conf) => ({
        ...acc,
        [conf.name || conf.type]: new FileSystem(
          conf.type,
          conf.basepath,
          conf.options
        )
      }),
      {}
    )

    return {
      apis,
      getAvailableAPIs: () => Object.keys(apis),
      listDirectory: () => {},
      deleteFile: () => {},
      deleteDirectory: () => {},
      makeDirectory: () => {},
      readFile: (api, filename, opts) => apis[api]?.readFile(filename, opts),
      writeFile: () => {},
      watchFile: () => {},
      watchDirectory: () => {}
    }
  },
  onReady: async (options, fields) => {
    const { messaging } = plugin('session')
    messaging.subscribe('fs', handleFileSystem(fields))
    // console.log('🗃 🗄 Egraze Filesystem Ready Plugin Ready!', options)

    // console.log('🗃 🗄 After sleep 2000ms')

    // // eslint-disable-next-line promise/param-names
    // await new Promise(r => setTimeout(r, 2000))
    // console.log('🗃 🗄 After sleep 2000ms')
    // // eslint-disable-next-line promise/param-names
    // await new Promise(r => setTimeout(r, 10000))
    // console.log('🗃 🗄 After sleep 10000ms')
  }
}

const handleFileSystem = fields => (event, action, payload) => {
  if (action && typeof fields[action] === 'function')
    return fields[action](payload)
}

function FileSystem(driver, basepath, options) {
  const fsd =
    driver &&
    fileSystemDrivers[driver] &&
    new fileSystemDrivers[driver](basepath, options)

  console.log('created file system with driver', driver, fsd)

  return fsd
}

const fileSystemDrivers = {
  os: function OSFileSystem(basepath, options) {
    const getFilePath = filename =>
      console.log(
        'Joining path:',
        filename,
        basepath,
        path.join(basepath, filename)
      ) || path.join(basepath, filename)
    return {
      listDirectory: () => {},
      deleteFile: () => {},
      deleteDirectory: () => {},
      makeDirectory: () => {},
      readFile: (filename, opts) => readFile(getFilePath(filename), opts),
      writeFile: () => {},
      watchFile: () => {},
      watchDirectory: () => {}
    }
  }
}
