import { dialog, ipcMain, ipcRenderer } from 'electron'
import { promises } from 'fs'
import path from 'path'
import { plugin } from '../../egraze-plugins'
import { FilesystemPluginAction, FilesystemPluginChannelName } from './types.d'

export const name = 'filesystem'

const { readFile, writeFile } = promises

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

    ipcMain.handle(FilesystemPluginChannelName, async (event, action) => {
      if (action.type === FilesystemPluginAction.ReadFile) {
        const result = await apis.os.readFile(action.payload.filePath, {
          encoding: 'utf8'
        })
        return result
      }
      if (action.type === FilesystemPluginAction.WriteFile) {
        const result = await apis.os.writeFile(
          action.payload.filePath,
          action.payload.fileData,
          {
            encoding: 'utf8'
          }
        )
        return result
      }
      if (action.type === FilesystemPluginAction.ShowSaveDialog) {
        const session = plugin('session')
        const windows = session.getWindows()
        const window = windows.find(win => win.id === action.windowId)
        const result = await apis.os.selectFileLocation(
          window?.window,
          action.payload.existingName
        )
        return result
      }
      throw new Error(`Unhandled action type "${action.type}"`)
    })

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
  }
}

/**
 * @type {import('../../egraze-plugins').RendererPlugin}
 */
export const renderer = {
  init: () => {
    const sendMessage = (action, payload) => {
      const session = plugin('session')

      return ipcRenderer.invoke(FilesystemPluginChannelName, {
        type: action,
        windowId: session.windowId,
        payload
      })
    }
    const rendererAPI = {
      readFile: async filePath => {
        const result = await sendMessage(FilesystemPluginAction.ReadFile, {
          filePath
        })
        return result
      },
      writeFile: async (filePath, fileData) => {
        const result = await sendMessage(FilesystemPluginAction.WriteFile, {
          fileData,
          filePath
        })
        return result
      },
      selectFileLocation: async existingName => {
        const result = await sendMessage(
          FilesystemPluginAction.ShowSaveDialog,
          { existingName }
        )
        return result
      }
    }
    return rendererAPI
  }
}

function FileSystem(driver, basepath, options) {
  const fsd =
    driver &&
    fileSystemDrivers[driver] &&
    new fileSystemDrivers[driver](basepath, options)

  return fsd
}

const fileSystemDrivers = {
  os: function OSFileSystem(basepath, options) {
    const getFilePath = filename => path.join(basepath, filename)
    return {
      listDirectory: () => {},
      deleteFile: () => {},
      deleteDirectory: () => {},
      makeDirectory: () => {},
      readFile: (filename, opts) => readFile(getFilePath(filename), opts),
      writeFile: (filename, contents, opts) =>
        writeFile(getFilePath(filename), contents, opts).then(() => contents),
      watchFile: () => {},
      watchDirectory: () => {},
      selectFileLocation: async (window, defaultPath) => {
        const res = await dialog.showSaveDialog(window, {
          title: 'Save File',
          defaultPath,
          buttonLabel: 'Save Djot',
          filters: [
            {
              name: 'Djot File',
              extensions: ['.djot']
            }
          ]
        })
        return res
      }
    }
  }
}
