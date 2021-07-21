import React from 'react'
import { dialog, ipcMain, ipcRenderer } from 'electron'
import { promises } from 'fs'
import path from 'path'
import { plugin } from '../../egraze-plugins'
import { NotebooksService } from './notebooks.context'
import { NotebooksPluginChannelName, NotebooksPluginAction } from './types.d'

export const name = 'notebooks'

/** @type {import('../../egraze-plugins').MainPlugin} */
export const main = {
  init: () => {
    const mainAPI = {}

    ipcMain.handle(NotebooksPluginChannelName, async (event, action) => {
      if (action.type === NotebooksPluginAction.SaveToFile) {
        return { stuff: 'worked' }
      }
      throw new Error(`Unhandled action type "${action.type}"`)
    })

    return mainAPI
  }
}

/**
 * @type {import('../../egraze-plugins').RendererPlugin}
 */
export const renderer = {
  init: () => {
    const sendMessage = (action, payload) => {
      const session = plugin('session')

      return ipcRenderer.invoke(NotebooksPluginChannelName, {
        type: action,
        windowId: session.windowId,
        payload
      })
    }
    const rendererAPI = {
      saveToFile: async (notebook, filename) => {
        console.log(`🐬`, 'saving to file:', notebook, filename)
        const result = await sendMessage(NotebooksPluginAction.SaveToFile, { notebook, filename })
        console.log(`🐬`, 'saving result:', result)
        return result
      }
    }
    return rendererAPI
  },
  Wrapper: ({ fields, children }) => {
    return <NotebooksService fields={fields}>{children}</NotebooksService>
  }
}
