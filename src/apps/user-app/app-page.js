import React from 'react'
import NotebookPage from 'djitsu/views/notebook-page'
import { useNotebook } from 'djitsu/providers/notebook'
import { importHandlerMaker } from 'djitsu/compilers/javascript'

export const AppPage = (props) => {
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
    <NotebookPage
      notebookName={props.notebookName}
      notebookUsername={props.username}
      exported={'Main'}
      importHandler={importLoader}
    />
  )
}

AppPage.propTypes = {}

export default AppPage
