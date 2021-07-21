import React, { createContext, useContext } from 'react'
import useStates from '../../../modules/utils/hooks/use-states'

const NotebooksContext = createContext([
  {},
  {
    saveToFile: (notebook, filepath) => Promise.resolve()
  }
])

export const NotebooksService = ({ children, fields }) => {
  const [state, setState] = useStates({})

  const actions = {
    setState,
    saveToFile: async (notebook, filepath) => {
      console.log('🎑', 'saving notebook:', { notebook, filepath, fields })
      const result = await fields.saveToFile(notebook, filepath)
      console.log('🎑', 'save result:', result)
      return result
    }
  }
  const context = [state, actions]
  return (
    <NotebooksContext.Provider value={context}>
      {children}
    </NotebooksContext.Provider>
  )
}

/** @type {UseNotebooks} */
export const useNotebooks = () => useContext(NotebooksContext)

/**
 * @callback UseNotebooks
 * @returns {[NotebooksState, NotebooksActions]}
 */

/**
 * @typedef NotebooksState
 * @property {string} happy
 */

/**
 * @typedef NotebooksActions
 * @property {SaveToFileAction} saveToFile
 */

/**
 * @callback SaveToFileAction
 * @param {import('../../../modules/core/schema/notebook').Notebook} notebook
 * @param {string} filepath
 */
