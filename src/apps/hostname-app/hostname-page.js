import React from 'react'
import NotebookHostname from 'djitsu/views/notebook-hostname'
import { useNotebook } from 'djitsu/providers/notebook'
import { importHandlerMaker } from 'djitsu/compilers/javascript'

export const HostnamePage = (props) => {
  const [, notebookActions] = useNotebook()

  const isNotebook = async ({ username, notebookName, version }) => {
    try {
      await notebookActions.getNotebookId(notebookName, username, version)
      return true
    } catch {
      return false
    }
  }
  const getNotebook = async ({ username, notebookName, version }) => {
    try {
      const result = await notebookActions.getNotebookByName(
        notebookName,
        username,
        version
      )
      return result
    } catch (error) {
      console.log('error getting notebok:', error)
    }
  }

  const importLoader = importHandlerMaker({ isNotebook, getNotebook })

  return (
    <NotebookHostname hostname={props.hostname} importHandler={importLoader} />
  )
}

export default HostnamePage
